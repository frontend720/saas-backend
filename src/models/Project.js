import mongoose from 'mongoose';
import slugify from 'slugify';

const STATUS = ['draft', 'active', 'archived', 'deleted'];

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: STATUS,
      default: 'draft',
      index: true,
    },

    // --- Flexible metadata (store feature-specific data here) ---
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    // --- Collaboration ---
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Usage tracking (for tier enforcement) ---
    assetCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// --- Indexes ---
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ owner: 1, createdAt: -1 });
// projectSchema.index({ tags: 1 });
projectSchema.index({ name: 'text', description: 'text' });

// --- Pre-save: generate slug ---
projectSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    const base = slugify(this.name, { lower: true, strict: true });
    // Append short unique suffix to prevent collisions
    const suffix = this._id.toString().slice(-6);
    this.slug = `${base}-${suffix}`;
  }
  next();
});

// --- Virtuals ---
projectSchema.virtual('assets', {
  ref: 'Asset',
  localField: '_id',
  foreignField: 'project',
});

// --- Statics ---
projectSchema.statics.STATUS = STATUS;

const Project = mongoose.model('Project', projectSchema);

export default Project;
