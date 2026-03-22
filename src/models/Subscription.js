import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // --- Stripe references ---
    stripeSubscriptionId: { type: String, required: true, unique: true },
    stripeCustomerId: { type: String, required: true },
    stripePriceId: { type: String, required: true },

    // --- State ---
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired'],
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['pro', 'enterprise'],
      required: true,
    },
    interval: {
      type: String,
      enum: ['month', 'year'],
      required: true,
    },

    // --- Dates ---
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    canceledAt: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialStart: { type: Date, default: null },
    trialEnd: { type: Date, default: null },

    // --- Billing history (last 3 invoices for quick reference) ---
    recentInvoices: [
      {
        invoiceId: String,
        amountPaid: Number, // cents
        currency: { type: String, default: 'usd' },
        paidAt: Date,
        receiptUrl: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { transform: (_, ret) => { delete ret.__v; return ret; } },
  }
);

// --- Indexes ---
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
