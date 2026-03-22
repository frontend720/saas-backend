import mongoose from 'mongoose';

const ASSET_TYPES = ['image', 'video', 'document', 'audio', 'other'];

const assetSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ASSET_TYPES,
      default: 'other',
    },
    size: {
      type: Number, // bytes
      required: true,
    },

    // --- Storage ---
    storageKey: {
      type: String, // S3 key or local path
      required: true,
      unique: true,
    },
    url: {
      type: String, // public or signed URL
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },

    // --- Metadata ---
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // width, height, duration, pages, etc.
    },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// --- Indexes ---
assetSchema.index({ project: 1, isDeleted: 1, createdAt: -1 });
assetSchema.index({ uploadedBy: 1 });
assetSchema.index({ mimeType: 1 });

// --- Statics ---
assetSchema.statics.TYPES = ASSET_TYPES;

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
