import { catchAsync } from '../utils/AppError.js';
import { success, created, noContent, paginated } from '../utils/response.js';
import assetService from '../services/assetService.js';

export const create = catchAsync(async (req, res) => {
  const asset = await assetService.create(req.body, req.params.projectId, req.user._id);
  created(res, { asset });
});

export const list = catchAsync(async (req, res) => {
  const result = await assetService.listByProject(req.params.projectId, req.query);
  paginated(res, result);
});

export const getById = catchAsync(async (req, res) => {
  const asset = await assetService.getById(req.params.id);
  success(res, { asset });
});

export const update = catchAsync(async (req, res) => {
  const asset = await assetService.update(req.params.id, req.body);
  success(res, { asset });
});

export const remove = catchAsync(async (req, res) => {
  await assetService.softDelete(req.params.id);
  noContent(res);
});

export const getStorageUsage = catchAsync(async (req, res) => {
  const usage = await assetService.getProjectStorageUsage(req.params.projectId);
  success(res, { usage });
});
