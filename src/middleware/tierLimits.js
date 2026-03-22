import { Project } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Tier-based limits. Adjust these as your pricing model evolves.
 */
const TIER_LIMITS = {
  free: {
    maxProjects: 3,
    maxAssetsPerProject: 10,
    maxAssetSizeMB: 5,
    maxCollaboratorsPerProject: 0,
  },
  pro: {
    maxProjects: 50,
    maxAssetsPerProject: 500,
    maxAssetSizeMB: 100,
    maxCollaboratorsPerProject: 10,
  },
  enterprise: {
    maxProjects: Infinity,
    maxAssetsPerProject: Infinity,
    maxAssetSizeMB: 500,
    maxCollaboratorsPerProject: Infinity,
  },
};

export const getLimits = (tier) => TIER_LIMITS[tier] || TIER_LIMITS.free;

/**
 * Middleware: check if user can create another project.
 */
export const checkProjectLimit = async (req, _res, next) => {
  const limits = getLimits(req.user.tier);
  if (req.user.role === 'admin') return next();

  const count = await Project.countDocuments({
    owner: req.user._id,
    status: { $ne: 'deleted' },
  });

  if (count >= limits.maxProjects) {
    return next(
      AppError.forbidden(
        `Your ${req.user.tier} plan allows ${limits.maxProjects} projects. Upgrade to create more.`
      )
    );
  }

  next();
};

/**
 * Middleware: check if project can accept another asset.
 */
export const checkAssetLimit = async (req, _res, next) => {
  const limits = getLimits(req.user.tier);
  if (req.user.role === 'admin') return next();

  const project = req.project; // set by loadProject middleware
  if (!project) return next(AppError.internal('Project not loaded'));

  if (project.assetCount >= limits.maxAssetsPerProject) {
    return next(
      AppError.forbidden(
        `Your ${req.user.tier} plan allows ${limits.maxAssetsPerProject} assets per project. Upgrade for more.`
      )
    );
  }

  next();
};

export default { getLimits, checkProjectLimit, checkAssetLimit };
