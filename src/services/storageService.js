import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { bucket } from '../config/firebase.js';

const GCS_BASE = 'https://storage.googleapis.com/bate-mates.appspot.com';

export const getAssetType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.includes('pdf') ||
    mimeType.startsWith('text/') ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) return 'document';
  return 'other';
};

const uploadBuffer = async (buffer, storageKey, contentType) => {
  await bucket.file(storageKey).save(buffer, {
    metadata: { contentType },
    public: true,
  });
  return `${GCS_BASE}/${storageKey}`;
};

const process = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const id = uuidv4();
  const storageKey = `assets/${id}${ext}`;

  const [url] = await Promise.all([
    uploadBuffer(file.buffer, storageKey, file.mimetype),
  ]);

  let thumbnailUrl = null;

  if (file.mimetype.startsWith('image/')) {
    const thumbBuffer = await sharp(file.buffer)
      .resize({ width: 400, height: 400, fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();

    thumbnailUrl = await uploadBuffer(
      thumbBuffer,
      `assets/thumbs/${id}.jpg`,
      'image/jpeg'
    );
  }

  return {
    storageKey,
    url,
    thumbnailUrl,
    filename: path.basename(storageKey),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    type: getAssetType(file.mimetype),
  };
};

export default { process, getAssetType };
