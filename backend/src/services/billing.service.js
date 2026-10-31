import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { getRazorpay } from '../config/razorpay.js';
import { supabaseAdmin } from '../config/supabase.js';
import { HttpError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// Monthly billing cycles to authorise up front (Razorpay requires a total; 10 years ≈ open-ended).
const TOTAL_BILLING_CYCLES = 120;

// Marks a subscription the user cancelled; it stays Pro until the current period ends.
export const CANCELLING_STATUS = 'cancelling';

function requireRazorpay() {
  const razorpay = getRazorpay();
  if (!razorpay || !env.razorpayPlanId) {
    throw new HttpError(503, 'Payments are not set up yet.', 'BILLING_NOT_CONFIGURED');
  }
  return razorpay;
}

async function getSubscriptionRow(userId) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, razorpay_subscription_id, razorpay_status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateSubscriptionRow(match, fields) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .match(match);
  if (error) throw error;
}

/**
 * Starts a Pro subscription and returns Razorpay's hosted payment page URL.
 * The plan only changes once Razorpay confirms payment via the webhook.
 */
export async function createProSubscription(user) {
  const razorpay = requireRazorpay();
  const row = await getSubscriptionRow(user.id);
  if (row?.plan === 'pro' && row.status === 'active') {
    throw new HttpError(409, 'You are already on the Pro plan.', 'ALREADY_PRO');
  }

  const subscription = await razorpay.subscriptions.create({
    plan_id: env.razorpayPlanId,
    total_count: TOTAL_BILLING_CYCLES,
    customer_notify: true,
    notes: { user_id: user.id, email: user.email ?? '' },
  });

  await updateSubscriptionRow(
    { user_id: user.id },
    { razorpay_subscription_id: subscription.id, razorpay_status: subscription.status },
  );
  return { checkoutUrl: subscription.short_url };
}

// Cancels at the end of the paid period, so the user keeps Pro until then.
export async function cancelProSubscription(userId) {
  const razorpay = requireRazorpay();
  const row = await getSubscriptionRow(userId);
  if (!row?.razorpay_subscription_id || row.plan !== 'pro') {
    throw new HttpError(400, 'There is no active Pro subscription to cancel.', 'NO_SUBSCRIPTION');
  }
  await razorpay.subscriptions.cancel(row.razorpay_subscription_id, true);
  await updateSubscriptionRow({ user_id: userId }, { razorpay_status: CANCELLING_STATUS });
}

let priceLabelCache = null;

/** "₹499/month", read once from the Razorpay plan so the UI always matches what is charged. null if unavailable. */
export async function getProPriceLabel() {
  if (priceLabelCache) return priceLabelCache;
  const razorpay = getRazorpay();
  if (!razorpay || !env.razorpayPlanId) return null;
  try {
    const plan = await razorpay.plans.fetch(env.razorpayPlanId);
    const price = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: plan.item.currency,
      maximumFractionDigits: plan.item.amount % 100 === 0 ? 0 : 2,
    }).format(plan.item.amount / 100);
    const every = plan.interval > 1 ? `${plan.interval} ` : '';
    const unit = { daily: 'day', weekly: 'week', monthly: 'month', quarterly: 'quarter', yearly: 'year' }[plan.period] ?? plan.period;
    priceLabelCache = `${price}/${every}${unit}`;
    return priceLabelCache;
  } catch (err) {
    logger.warn(`Could not load Razorpay plan ${env.razorpayPlanId}: ${err.error?.description ?? err.message}`);
    return null;
  }
}

export function isValidWebhookSignature(rawBody, signature) {
  if (!env.razorpayWebhookSecret || !signature) return false;
  return Razorpay.validateWebhookSignature(rawBody, signature, env.razorpayWebhookSecret);
}

// Razorpay subscription status → our { plan, status }. null = leave the plan as is.
function planForRazorpayStatus(status) {
  switch (status) {
    case 'active':
      return { plan: 'pro', status: 'active' };
    case 'pending':
    case 'halted':
    case 'paused':
      return { plan: 'pro', status: 'past_due' }; // past_due Pro gets Free limits
    case 'cancelled':
    case 'completed':
    case 'expired':
      return { plan: 'free', status: 'canceled' };
    default:
      return null; // created, authenticated
  }
}

/** Applies a verified Razorpay subscription.* webhook event to the subscriptions table. */
export async function applySubscriptionEvent(event) {
  const entity = event?.payload?.subscription?.entity;
  if (!event?.event?.startsWith('subscription.') || !entity?.id) return;

  const fields = { razorpay_subscription_id: entity.id, razorpay_status: entity.status };
  const mapped = planForRazorpayStatus(entity.status);
  if (mapped) Object.assign(fields, mapped);
  if (entity.current_end) fields.current_period_end = new Date(entity.current_end * 1000).toISOString();

  // A cancelled-at-period-end subscription can still send "active" updates; keep showing it as cancelling.
  const row = await findRowForSubscription(entity);
  if (!row) {
    logger.warn(`Razorpay webhook for unknown subscription ${entity.id} (${event.event})`);
    return;
  }
  if (row.razorpay_status === CANCELLING_STATUS && entity.status === 'active') {
    fields.razorpay_status = CANCELLING_STATUS;
  }
  await updateSubscriptionRow({ user_id: row.user_id }, fields);
}

async function findRowForSubscription(entity) {
  const bySubscription = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, razorpay_status')
    .eq('razorpay_subscription_id', entity.id)
    .maybeSingle();
  if (bySubscription.error) throw bySubscription.error;
  if (bySubscription.data) return bySubscription.data;

  const userId = entity.notes?.user_id;
  if (!userId) return null;
  const byUser = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, razorpay_status')
    .eq('user_id', userId)
    .maybeSingle();
  if (byUser.error) throw byUser.error;
  return byUser.data;
}
