export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const GMAIL_URL = 'https://mail.google.com/';

// Display only; the charged amount comes from the Razorpay plan.
export const PRO_PRICE_LABEL = '$19/month';

export const STORAGE_KEYS = {
  SIDEBAR_ENABLED: 'ds.sidebarEnabled',
};

export const DEFAULT_SETTINGS = {
  [STORAGE_KEYS.SIDEBAR_ENABLED]: true,
};
