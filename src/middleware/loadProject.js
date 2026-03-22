import { Project } from '../models/index.js';
import { AppError, catchAsync } from '../utils/AppError.js';

export const loadProject = catchAsync(async (req, _res, next) => {
  const project = await Project.findOne({
    _id: req.params.projectId,
    status: { $ne: 'deleted' },
  });
  if (!project) throw AppError.notFound('Project not found');
  req.project = project;
  next();
});
