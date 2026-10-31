import Razorpay from 'razorpay';
import { env } from './env.js';

let client = null;

// null until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set, so the rest of the API runs without billing.
export function getRazorpay() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return null;
  client ??= new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  return client;
}
