import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['user', 'pro', 'admin'];
const TIERS = ['free', 'pro', 'enterprise'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
    tier: {
      type: String,
      enum: TIERS,
      default: 'free',
    },

    // --- Stripe integration (ready when you need it) ---
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing', 'none'],
      default: 'none',
    },
    currentPeriodEnd: { type: Date, default: null },

    // --- Account state ---
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Indexes ---
userSchema.index({ tier: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// --- Pre-save: hash password ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// --- Instance methods ---
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedAt;
  }
  return false;
};

userSchema.methods.isPro = function () {
  return this.tier === 'pro' || this.tier === 'enterprise' || this.role === 'admin';
};

// --- Statics ---
userSchema.statics.ROLES = ROLES;
userSchema.statics.TIERS = TIERS;

const User = mongoose.model('User', userSchema);

export default User;
