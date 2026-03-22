import { Project, Asset } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { QueryBuilder } from '../utils/queryBuilder.js';

class ProjectService {
  async create(data, userId) {
    const project = await Project.create({ ...data, owner: userId });
    return project;
  }

  async list(query, userId) {
    const qb = new QueryBuilder(query, ['status', 'tags', 'createdAt']);

    // Only show user's own projects + projects they collaborate on
    const ownerFilter = {
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
      ],
      status: { $ne: 'deleted' },
      ...qb.filter,
    };

    // Text search
    if (qb.search) {
      ownerFilter.$text = { $search: qb.search };
    }

    const [docs, total] = await Promise.all([
      Project.find(ownerFilter)
        .sort(qb.sort)
        .skip(qb.skip)
        .limit(qb.limit)
        .select(qb.fields)
        .populate('owner', 'name email avatar')
        .lean(),
      Project.countDocuments(ownerFilter),
    ]);

    return { docs, total, page: qb.page, limit: qb.limit };
  }

  async getById(projectId, userId) {
    const project = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    // Access check: owner, collaborator, or admin
    this._checkAccess(project, userId);

    return project;
  }

  async getBySlug(slug, userId) {
    const project = await Project.findOne({ slug })
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    this._checkAccess(project, userId);

    return project;
  }

  async update(projectId, data, userId) {
    const project = await Project.findById(projectId);
    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    this._checkWriteAccess(project, userId);

    Object.assign(project, data);
    project.lastActivityAt = new Date();
    await project.save();

    return project;
  }

  async softDelete(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    // Only owner can delete
    if (project.owner.toString() !== userId.toString()) {
      throw AppError.forbidden('Only the project owner can delete');
    }

    project.status = 'deleted';
    await project.save();

    // Soft-delete all assets
    await Asset.updateMany({ project: projectId }, { isDeleted: true });

    return project;
  }

  async addCollaborator(projectId, { userId: collabUserId, role }, requesterId) {
    const project = await Project.findById(projectId);
    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    this._checkWriteAccess(project, requesterId);

    // Can't add owner as collaborator
    if (project.owner.toString() === collabUserId) {
      throw AppError.badRequest('Cannot add the project owner as a collaborator');
    }

    // Check if already a collaborator
    const existing = project.collaborators.find(
      (c) => c.user.toString() === collabUserId
    );
    if (existing) {
      existing.role = role;
    } else {
      project.collaborators.push({ user: collabUserId, role });
    }

    await project.save();
    return project;
  }

  async removeCollaborator(projectId, collabUserId, requesterId) {
    const project = await Project.findById(projectId);
    if (!project || project.status === 'deleted') {
      throw AppError.notFound('Project not found');
    }

    this._checkWriteAccess(project, requesterId);

    project.collaborators = project.collaborators.filter(
      (c) => c.user.toString() !== collabUserId
    );
    await project.save();

    return project;
  }

  // --- Access helpers ---

  _checkAccess(project, userId) {
    const isOwner = project.owner._id
      ? project.owner._id.toString() === userId.toString()
      : project.owner.toString() === userId.toString();

    const isCollab = project.collaborators?.some(
      (c) => {
        const id = c.user._id ? c.user._id.toString() : c.user.toString();
        return id === userId.toString();
      }
    );

    if (!isOwner && !isCollab) {
      throw AppError.forbidden('You do not have access to this project');
    }
  }

  _checkWriteAccess(project, userId) {
    const isOwner = project.owner.toString() === userId.toString();

    const collab = project.collaborators?.find(
      (c) => c.user.toString() === userId.toString()
    );
    const isEditor = collab && ['editor', 'admin'].includes(collab.role);

    if (!isOwner && !isEditor) {
      throw AppError.forbidden('You do not have write access to this project');
    }
  }
}

export default new ProjectService();
