import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { countUsageThisMonth } from './usage.service.js';

// null = unlimited
export const PLAN_LIMITS = {
  free: env.freeMonthlyLimit,
  pro: null,
};

/**
 * Returns the user's effective plan and this month's usage:
 * { plan, status, currentPeriodEnd, cancelAtPeriodEnd, billingEnabled, limit, used, remaining }
 * A Pro plan that isn't active falls back to Free limits.
 */
export async function getAccountStatus(userId) {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status, current_period_end, razorpay_status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;

  const isActivePro = subscription?.plan === 'pro' && subscription.status === 'active';
  const plan = isActivePro ? 'pro' : 'free';
  const limit = PLAN_LIMITS[plan];
  const used = await countUsageThisMonth(userId);

  return {
    plan,
    status: subscription?.status ?? 'active',
    currentPeriodEnd: subscription?.current_period_end ?? null,
    // Set by billing.service when the user cancels; Pro stays until the period ends.
    cancelAtPeriodEnd: isActivePro && subscription?.razorpay_status === 'cancelling',
    billingEnabled: Boolean(env.razorpayKeyId && env.razorpayKeySecret && env.razorpayPlanId),
    limit,
    used,
    remaining: limit === null ? null : Math.max(limit - used, 0),
  };
}
