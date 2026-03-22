import { Asset, Project } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { QueryBuilder } from '../utils/queryBuilder.js';

class AssetService {
  async create(data, projectId, userId) {
    const asset = await Asset.create({
      ...data,
      project: projectId,
      uploadedBy: userId,
    });

    // Increment project asset count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { assetCount: 1 },
      lastActivityAt: new Date(),
    });

    return asset;
  }

  async listByProject(projectId, query) {
    const qb = new QueryBuilder(query, ['type', 'mimeType', 'createdAt']);

    const filter = {
      project: projectId,
      isDeleted: false,
      ...qb.filter,
    };

    const [docs, total] = await Promise.all([
      Asset.find(filter)
        .sort(qb.sort)
        .skip(qb.skip)
        .limit(qb.limit)
        .select(qb.fields)
        .populate('uploadedBy', 'name email avatar')
        .lean(),
      Asset.countDocuments(filter),
    ]);

    return { docs, total, page: qb.page, limit: qb.limit };
  }

  async getById(assetId) {
    const asset = await Asset.findOne({ _id: assetId, isDeleted: false })
      .populate('uploadedBy', 'name email avatar');

    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    return asset;
  }

  async update(assetId, data) {
    const asset = await Asset.findOneAndUpdate(
      { _id: assetId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    return asset;
  }

  async softDelete(assetId) {
    const asset = await Asset.findOneAndUpdate(
      { _id: assetId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    // Decrement project asset count
    await Project.findByIdAndUpdate(asset.project, {
      $inc: { assetCount: -1 },
    });

    return asset;
  }

  async getProjectStorageUsage(projectId) {
    const result = await Asset.aggregate([
      { $match: { project: projectId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
          count: { $sum: 1 },
          byType: {
            $push: { type: '$type', size: '$size' },
          },
        },
      },
    ]);

    if (!result.length) {
      return { totalSize: 0, count: 0, byType: {} };
    }

    // Summarize by type
    const byType = result[0].byType.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = { count: 0, size: 0 };
      acc[item.type].count++;
      acc[item.type].size += item.size;
      return acc;
    }, {});

    return {
      totalSize: result[0].totalSize,
      count: result[0].count,
      byType,
    };
  }
}

export default new AssetService();
