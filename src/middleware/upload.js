import multer from 'multer';

const fileFilter = (_req, file, cb) => {
  if (/^(image|video|audio)\//.test(file.mimetype) ||
      /^application\/(pdf|msword|vnd\.|zip|x-zip)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
}).single('file');
