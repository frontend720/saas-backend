import { catchAsync } from '../utils/AppError.js';
import { success, paginated } from '../utils/response.js';
import { User, Project, Asset, Subscription } from '../models/index.js';
import { QueryBuilder } from '../utils/queryBuilder.js';
import { AppError } from '../utils/AppError.js';

export const listUsers = catchAsync(async (req, res) => {
  const qb = new QueryBuilder(req.query, ['role', 'tier', 'isActive', 'createdAt']);

  const filter = { ...qb.filter };
  if (qb.search) {
    filter.$or = [
      { name: { $regex: qb.search, $options: 'i' } },
      { email: { $regex: qb.search, $options: 'i' } },
    ];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .sort(qb.sort)
      .skip(qb.skip)
      .limit(qb.limit)
      .select(qb.fields)
      .lean(),
    User.countDocuments(filter),
  ]);

  paginated(res, { docs, total, page: qb.page, limit: qb.limit });
});

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError.notFound('User not found');
  success(res, { user });
});

export const updateUser = catchAsync(async (req, res) => {
  // Admin can update role, tier, isActive
  const allowed = ['role', 'tier', 'isActive'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw AppError.notFound('User not found');

  success(res, { user });
});

export const platformStats = catchAsync(async (_req, res) => {
  const [userStats, projectCount, assetCount, subscriptionStats] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          free: { $sum: { $cond: [{ $eq: ['$tier', 'free'] }, 1, 0] } },
          pro: { $sum: { $cond: [{ $eq: ['$tier', 'pro'] }, 1, 0] } },
          enterprise: { $sum: { $cond: [{ $eq: ['$tier', 'enterprise'] }, 1, 0] } },
        },
      },
    ]),
    Project.countDocuments({ status: { $ne: 'deleted' } }),
    Asset.countDocuments({ isDeleted: false }),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$interval',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  success(res, {
    users: userStats[0] || { total: 0, active: 0, free: 0, pro: 0, enterprise: 0 },
    projects: projectCount,
    assets: assetCount,
    activeSubscriptions: subscriptionStats,
  });
});
