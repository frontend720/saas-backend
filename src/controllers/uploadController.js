import { AppError, catchAsync } from '../utils/AppError.js';
import { created } from '../utils/response.js';
import storageService from '../services/storageService.js';
import { getLimits } from '../middleware/tierLimits.js';

export const upload = catchAsync(async (req, res) => {
  if (!req.file) {
    throw AppError.badRequest('No file provided');
  }

  const limits = getLimits(req.user.tier);
  const maxBytes = limits.maxAssetSizeMB * 1024 * 1024;
  if (req.file.size > maxBytes) {
    throw AppError.forbidden(
      `Your ${req.user.tier} plan allows files up to ${limits.maxAssetSizeMB}MB.`
    );
  }

  const fileData = storageService.process(req.file);
  created(res, fileData);
});
