import { saveImagesToIDB, loadImagesFromIDB, clearImagesFromIDB, type StoredImage } from './draftImageStore';

export interface JobDraft {
  selectedCategory: number | null;
  details: {
    title: string;
    description: string;
    budget: string;
    images: any[];
  };
  location: {
    street: string;
    crossStreet: string;
    city: string;
    zip: string;
    showExactAddress: boolean;
  };
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  phone?: string;
  timestamp: number;
}

// Text-only draft stored in localStorage / sessionStorage (no image binary data)
interface DraftTextData {
  selectedCategory: number | null;
  details: {
    title: string;
    description: string;
    budget: string;
    // Only image metadata (id, filename, type, isFeatured) — no blobs
    imageMeta: Array<{ id: string; filename: string; type: string; isFeatured: boolean }>;
  };
  location: {
    street: string;
    crossStreet: string;
    city: string;
    zip: string;
    showExactAddress: boolean;
  };
  coordinates?: { lat: number; lng: number } | null;
  phone?: string;
  timestamp: number;
}

const DRAFT_KEY = 'job_draft';
const SESSION_DRAFT_KEY = 'job_draft_session';
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Safely write to a storage target (localStorage or sessionStorage).
 * Returns true on success, false if quota is exceeded or storage is unavailable.
 */
function safeSetItem(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`Failed to write to ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`, err);
    return false;
  }
}

/**
 * Save the job draft.
 * - Text data → both localStorage AND sessionStorage (redundancy)
 * - Image blobs → IndexedDB (large storage, no base64 overhead)
 */
export const saveDraft = async (draft: Omit<JobDraft, 'timestamp'>): Promise<void> => {
  try {
    // Build image metadata (lightweight, no binary data)
    const imageMeta = draft.details.images.map((img: any) => ({
      id: img.id,
      filename: img.file instanceof File ? img.file.name : (img.filename || 'image.jpg'),
      type: img.file instanceof File ? img.file.type : (img.type || 'image/jpeg'),
      isFeatured: img.isFeatured,
    }));

    // Build text-only draft
    const textData: DraftTextData = {
      selectedCategory: draft.selectedCategory,
      details: {
        title: draft.details.title,
        description: draft.details.description,
        budget: draft.details.budget,
        imageMeta,
      },
      location: draft.location,
      coordinates: draft.coordinates,
      phone: draft.phone,
      timestamp: Date.now(),
    };

    const json = JSON.stringify(textData);

    // Save text data to both storages for redundancy
    safeSetItem(localStorage, DRAFT_KEY, json);
    safeSetItem(sessionStorage, SESSION_DRAFT_KEY, json);

    // Save image blobs to IndexedDB
    const storedImages: StoredImage[] = draft.details.images
      .filter((img: any) => img.file instanceof File || img.file instanceof Blob)
      .map((img: any) => ({
        id: img.id,
        blob: img.file instanceof File ? img.file : img.file,
        filename: img.file instanceof File ? img.file.name : (img.filename || 'image.jpg'),
        type: img.file instanceof File ? img.file.type : (img.type || 'image/jpeg'),
        isFeatured: img.isFeatured,
      }));

    if (storedImages.length > 0) {
      await saveImagesToIDB(storedImages);
    }
  } catch (err) {
    console.warn('Error saving draft:', err);
  }
};

/**
 * Read raw text data from sessionStorage first, then fall back to localStorage.
 */
function loadTextData(): DraftTextData | null {
  // Try sessionStorage first (same tab, most reliable for auth redirect flow)
  let raw = sessionStorage.getItem(SESSION_DRAFT_KEY);

  // Fall back to localStorage
  if (!raw) {
    raw = localStorage.getItem(DRAFT_KEY);
  }

  if (!raw) return null;

  try {
    const data: DraftTextData = JSON.parse(raw);

    // Check expiry
    if (Date.now() - data.timestamp > DRAFT_EXPIRY) {
      clearDraft();
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Synchronous check — does a draft exist?
 * Used by VerifyEmail and other places that just need to know if there's a pending draft.
 */
export const hasDraft = (): boolean => {
  return loadTextData() !== null;
};

/**
 * Load the full draft including images from IndexedDB.
 * Returns null if no draft or if expired.
 */
export const loadDraft = async (): Promise<JobDraft | null> => {
  const textData = loadTextData();
  if (!textData) return null;

  try {
    // Load image blobs from IndexedDB
    const storedImages = await loadImagesFromIDB();

    // Rebuild UploadedImage objects by matching metadata with blobs
    const images = (textData.details.imageMeta || []).map((meta) => {
      const stored = storedImages.find((s) => s.id === meta.id);
      if (stored) {
        const file = new File([stored.blob], meta.filename, { type: meta.type });
        return {
          id: meta.id,
          file,
          preview: URL.createObjectURL(file),
          isFeatured: meta.isFeatured,
        };
      }
      // Image blob not found in IDB — skip this image
      return null;
    }).filter(Boolean);

    return {
      selectedCategory: textData.selectedCategory,
      details: {
        title: textData.details.title,
        description: textData.details.description,
        budget: textData.details.budget,
        images,
      },
      location: textData.location,
      coordinates: textData.coordinates,
      phone: textData.phone,
      timestamp: textData.timestamp,
    };
  } catch (err) {
    console.warn('Error loading draft images from IndexedDB:', err);

    // Return draft without images rather than losing all data
    return {
      selectedCategory: textData.selectedCategory,
      details: {
        title: textData.details.title,
        description: textData.details.description,
        budget: textData.details.budget,
        images: [],
      },
      location: textData.location,
      coordinates: textData.coordinates,
      phone: textData.phone,
      timestamp: textData.timestamp,
    };
  }
};

/**
 * Clear draft from all storage targets.
 */
export const clearDraft = (): void => {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  try { sessionStorage.removeItem(SESSION_DRAFT_KEY); } catch { /* ignore */ }
  // Fire-and-forget IDB cleanup
  clearImagesFromIDB().catch(() => {});
};
