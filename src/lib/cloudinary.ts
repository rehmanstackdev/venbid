export const convertPdfToAvif = (url: string): string => {
  if (!url.toLowerCase().endsWith('.pdf')) {
    return url;
  }
  
  // Replace .pdf extension with .avif to display PDF as image
  // Example: https://res.cloudinary.com/dqtd4hqrj/image/upload/v1768896445/vendor-documents/mokequ6sre6bhnmogrd7.pdf
  // To: https://res.cloudinary.com/dqtd4hqrj/image/upload/v1768896445/vendor-documents/mokequ6sre6bhnmogrd7.avif
  
  return url.replace(/\.pdf$/i, '.avif');
};
