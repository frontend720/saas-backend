import { catchAsync, AppError } from '../utils/AppError.js';
import { success, created } from '../utils/response.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  PRICES,
} from '../services/stripeService.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// POST /api/stripe/checkout
export const checkout = catchAsync(async (req, res) => {
  const { plan = 'pro_monthly' } = req.body;

  const priceId = PRICES[plan];
  if (!priceId) throw AppError.badRequest(`Unknown plan: ${plan}`);

  const user = await User.findById(req.user._id);
  if (!user) throw AppError.notFound('User not found');

  const session = await createCheckoutSession({
    userId: user._id.toString(),
    email: user.email,
    priceId,
    successUrl: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${CLIENT_URL}/settings`,
  });

  created(res, { url: session.url });
});

// POST /api/stripe/portal
export const portal = catchAsync(async (req, res) => {
  const subscription = await Subscription.findOne({ user: req.user._id });
  if (!subscription?.stripeCustomerId) {
    throw AppError.badRequest('No billing account found');
  }

  const session = await createPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl: `${CLIENT_URL}/settings`,
  });

  success(res, { url: session.url });
});

// POST /api/stripe/webhook
export const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.error('[stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            user: userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: 'active',
            tier: 'pro',
            interval: 'month',
          },
          { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, { tier: 'pro' });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata.userId;

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          }
        );

        if (userId && sub.status === 'active') {
          await User.findByIdAndUpdate(userId, { tier: 'pro' });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata.userId;

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { status: 'canceled' }
        );

        if (userId) {
          await User.findByIdAndUpdate(userId, { tier: 'free' });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          {
            $push: {
              recentInvoices: {
                $each: [{
                  invoiceId: invoice.id,
                  amountPaid: invoice.amount_paid,
                  currency: invoice.currency,
                  paidAt: new Date(invoice.status_transitions.paid_at * 1000),
                  receiptUrl: invoice.hosted_invoice_url,
                }],
                $slice: -10,
              },
            },
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { status: 'past_due' }
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe] Error handling ${event.type}:`, err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
};
