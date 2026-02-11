export const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

export function isValidUsZip(zip: string): boolean {
  return US_ZIP_REGEX.test(zip.trim());
}
