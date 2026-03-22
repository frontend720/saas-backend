const getAssetType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.includes('pdf') ||
    mimeType.startsWith('text/') ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) {
    return 'document';
  }
  return 'other';
};

// Process a multer file object into asset-ready metadata.
// Swap this out for an S3 implementation when moving to production.
const process = (file) => ({
  storageKey: file.filename,
  url: `/uploads/${file.filename}`,
  filename: file.filename,
  originalName: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  type: getAssetType(file.mimetype),
});

export default { process, getAssetType };
