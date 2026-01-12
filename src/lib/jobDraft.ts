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

const DRAFT_KEY = 'job_draft';
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const base64ToFile = (base64: string, filename: string, type: string): File => {
  const arr = base64.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type });
};

export const saveDraft = async (draft: Omit<JobDraft, 'timestamp'>) => {
  const imagesWithBase64 = await Promise.all(
    draft.details.images.map(async (img: any) => {
      if (img.file instanceof File) {
        return {
          id: img.id,
          base64: await fileToBase64(img.file),
          filename: img.file.name,
          type: img.file.type,
          isFeatured: img.isFeatured,
        };
      }
      return img;
    })
  );

  const draftWithTimestamp: JobDraft = {
    ...draft,
    details: {
      ...draft.details,
      images: imagesWithBase64,
    },
    timestamp: Date.now(),
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draftWithTimestamp));
};

export const loadDraft = (): JobDraft | null => {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;

  try {
    const draft: JobDraft = JSON.parse(stored);
    if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
      clearDraft();
      return null;
    }

    const imagesWithFiles = draft.details.images.map((img: any) => {
      if (img.base64) {
        const file = base64ToFile(img.base64, img.filename, img.type);
        return {
          id: img.id,
          file,
          preview: URL.createObjectURL(file),
          isFeatured: img.isFeatured,
        };
      }
      return img;
    });

    return {
      ...draft,
      details: {
        ...draft.details,
        images: imagesWithFiles,
      },
    };
  } catch {
    return null;
  }
};

export const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};
