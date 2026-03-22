import Project from "../models/Project.js";
import Asset from "../models/Asset.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { AppError } from "../utils/AppError.js";

export const resolvers = {
  Query: {
    // -----------------------------------------------------------------------
    // Users
    // -----------------------------------------------------------------------
    me: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      return await User.findById(context.user.id);
    },

    users: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      if (context.user.role !== "admin")
        throw AppError.forbidden("Admin access required");
      return await User.find({ isActive: true }).sort("-createdAt");
    },

    user: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      if (context.user.role !== "admin")
        throw AppError.forbidden("Admin access required");
      const user = await User.findById(id);
      if (!user) throw AppError.notFound("User not found");
      return user;
    },

    // -----------------------------------------------------------------------
    // Projects
    // -----------------------------------------------------------------------
    myProjects: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      return await Project.find({
        owner: context.user.id,
        status: { $ne: "deleted" },
      }).sort("-createdAt");
    },

    project: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      const project = await Project.findOne({
        _id: id,
        owner: context.user.id,
        status: { $ne: "deleted" },
      });
      if (!project) throw AppError.notFound("Project not found");
      return project;
    },

    // -----------------------------------------------------------------------
    // Assets
    // -----------------------------------------------------------------------
    asset: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      const asset = await Asset.findOne({ _id: id, isDeleted: false });
      if (!asset) throw AppError.notFound("Asset not found");

      const project = await Project.findOne({
        _id: asset.project,
        owner: context.user.id,
      });
      if (!project)
        throw AppError.forbidden("You don't have access to this asset");

      return asset;
    },

    projectAssets: async (_, { projectId }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const project = await Project.findOne({
        _id: projectId,
        owner: context.user.id,
      });
      if (!project)
        throw AppError.forbidden("You don't have access to this project");

      return await Asset.find({ project: projectId, isDeleted: false }).sort(
        "-createdAt",
      );
    },

    // -----------------------------------------------------------------------
    // Subscriptions
    // -----------------------------------------------------------------------
    mySubscription: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      return await Subscription.findOne({
        user: context.user._id,
        status: { $nin: ["canceled", "incomplete_expired"] },
      });
    },

    subscriptions: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      if (context.user.role !== "admin")
        throw AppError.forbidden("Admin access required");
      return await Subscription.find().sort("-createdAt");
    },
  },

  Project: {
    assets: async (parent) => {
      return await Asset.find({ project: parent._id, isDeleted: false });
    },
  },

  Mutation: {
    // -----------------------------------------------------------------------
    // Projects
    // -----------------------------------------------------------------------
    createProject: async (_, { name, description }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const project = await Project.create({
        name,
        description,
        owner: context.user.id,
      });
      return project;
    },

    updateProject: async (_, { id, input }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const allowedFields = ["name", "description", "tags", "settings"];
      const updates = {};

      for (const [key, value] of Object.entries(input)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (key === "settings") {
            try {
              updates.settings = JSON.parse(value);
            } catch {
              throw new Error("Settings must be valid JSON");
            }
          } else {
            updates[key] = value;
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
      }

      const project = await Project.findOne({
        _id: id,
        owner: context.user.id,
        status: { $ne: "deleted" },
      });
      if (!project) throw AppError.notFound("Project not found");

      Object.assign(project, updates);
      project.lastActivityAt = new Date();
      await project.save();

      return project;
    },

    deleteProject: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      const project = await Project.findOneAndUpdate(
        { _id: id, owner: context.user.id },
        { status: "deleted" },
        { new: true },
      );
      if (!project) throw AppError.notFound("Project not found");
      return true;
    },

    // -----------------------------------------------------------------------
    // Assets
    // -----------------------------------------------------------------------
    registerAsset: async (_, args, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const project = await Project.findOne({
        _id: args.projectId,
        owner: context.user.id,
      });
      if (!project) throw AppError.notFound("Project not found");

      const asset = await Asset.create({
        project: project._id,
        uploadedBy: context.user.id,
        ...args,
      });

      project.assetCount += 1;
      await project.save();

      return asset;
    },

    updateAsset: async (_, { id, input }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const asset = await Asset.findOne({ _id: id, isDeleted: false });
      if (!asset) throw AppError.notFound("Asset not found");

      const project = await Project.findOne({
        _id: asset.project,
        owner: context.user.id,
      });
      if (!project)
        throw AppError.forbidden("You don't have access to this asset");

      const allowedFields = ["filename", "originalName", "meta"];
      for (const [key, value] of Object.entries(input)) {
        if (allowedFields.includes(key) && value !== undefined) {
          asset[key] = value;
        }
      }

      await asset.save();
      return asset;
    },

    deleteAsset: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const asset = await Asset.findOne({ _id: id, isDeleted: false });
      if (!asset) throw AppError.notFound("Asset not found");

      const project = await Project.findOne({
        _id: asset.project,
        owner: context.user.id,
      });
      if (!project)
        throw AppError.forbidden("You don't have access to this asset");

      asset.isDeleted = true;
      await asset.save();

      project.assetCount = Math.max(0, project.assetCount - 1);
      await project.save();

      return true;
    },

    // -----------------------------------------------------------------------
    // User profile
    // -----------------------------------------------------------------------
    updateProfile: async (_, { input }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const allowedFields = ["name", "avatar"];
      const updates = {};

      for (const [key, value] of Object.entries(input)) {
        if (key === "tier") {
          if (context.user.role !== "admin") {
            throw AppError.forbidden("Tier changes require admin privileges");
          }
          const validTiers = ["free", "pro", "enterprise"];
          if (!validTiers.includes(value)) {
            throw new Error(
              `Invalid tier. Must be one of: ${validTiers.join(", ")}`,
            );
          }
          updates.tier = value;
        } else if (allowedFields.includes(key) && value !== undefined) {
          updates[key] = value;
        }
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields to update");
      }

      const user = await User.findByIdAndUpdate(
        context.user._id,
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!user) throw AppError.notFound("User not found");
      return user;
    },

    changePassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const user = await User.findById(context.user._id).select("+password");
      if (!user) throw AppError.notFound("User not found");

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch)
        throw AppError.unauthorized("Current password is incorrect");

      user.password = newPassword;
      await user.save();

      return true;
    },

    // -----------------------------------------------------------------------
    // Subscriptions
    // -----------------------------------------------------------------------
    cancelSubscription: async (_, __, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");

      const subscription = await Subscription.findOne({
        user: context.user._id,
        status: "active",
      });
      if (!subscription)
        throw AppError.notFound("No active subscription found");

      // TODO: Call Stripe API to cancel at period end
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      //   cancel_at_period_end: true,
      // });

      subscription.cancelAtPeriodEnd = true;
      await subscription.save();

      return subscription;
    },

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------
    deleteUser: async (_, { id }, context) => {
      if (!context.user) throw AppError.unauthorized("Not authenticated");
      if (context.user.role !== "admin")
        throw AppError.forbidden("Admin access required");

      if (context.user._id.toString() === id) {
        throw new Error("Cannot delete your own account");
      }

      const user = await User.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true },
      );
      if (!user) throw AppError.notFound("User not found");
      return true;
    },
  },
};
