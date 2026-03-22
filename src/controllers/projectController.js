import { catchAsync } from '../utils/AppError.js';
import { success, created, noContent, paginated } from '../utils/response.js';
import projectService from '../services/projectService.js';

export const create = catchAsync(async (req, res) => {
  const project = await projectService.create(req.body, req.user._id);
  created(res, { project });
});

export const list = catchAsync(async (req, res) => {
  const result = await projectService.list(req.query, req.user._id);
  paginated(res, result);
});

export const getById = catchAsync(async (req, res) => {
  const project = await projectService.getById(req.params.id, req.user._id);
  success(res, { project });
});

export const getBySlug = catchAsync(async (req, res) => {
  const project = await projectService.getBySlug(req.params.slug, req.user._id);
  success(res, { project });
});

export const update = catchAsync(async (req, res) => {
  const project = await projectService.update(req.params.id, req.body, req.user._id);
  success(res, { project });
});

export const remove = catchAsync(async (req, res) => {
  await projectService.softDelete(req.params.id, req.user._id);
  noContent(res);
});

export const addCollaborator = catchAsync(async (req, res) => {
  const project = await projectService.addCollaborator(
    req.params.id,
    req.body,
    req.user._id
  );
  success(res, { project });
});

export const removeCollaborator = catchAsync(async (req, res) => {
  const project = await projectService.removeCollaborator(
    req.params.id,
    req.params.userId,
    req.user._id
  );
  success(res, { project });
});
