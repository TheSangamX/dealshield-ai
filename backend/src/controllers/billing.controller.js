import {
  applySubscriptionEvent,
  cancelProSubscription,
  createProSubscription,
  isValidWebhookSignature,
} from '../services/billing.service.js';
import { HttpError } from '../middleware/errorHandler.js';

// POST /api/billing/subscribe → { data: { checkoutUrl } }
export async function subscribe(req, res) {
  const result = await createProSubscription(req.user);
  res.json({ data: result });
}

// POST /api/billing/cancel → { data: { cancelled: true } }
export async function cancel(req, res) {
  await cancelProSubscription(req.user.id);
  res.json({ data: { cancelled: true } });
}

// POST /api/billing/webhook (raw body). Razorpay retries on non-2xx, so only bad signatures fail.
export async function razorpayWebhook(req, res) {
  const rawBody = req.body.toString('utf8');
  if (!isValidWebhookSignature(rawBody, req.get('x-razorpay-signature'))) {
    throw new HttpError(400, 'Invalid webhook signature.', 'INVALID_SIGNATURE');
  }
  await applySubscriptionEvent(JSON.parse(rawBody));
  res.json({ data: { received: true } });
}
