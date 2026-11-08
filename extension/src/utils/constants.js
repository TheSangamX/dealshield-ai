export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const GMAIL_URL = 'https://mail.google.com/';

export const PRIVACY_URL = 'https://dealshield-site.onrender.com/privacy.html';

export const STORAGE_KEYS = {
  SIDEBAR_ENABLED: 'ds.sidebarEnabled',
  DATA_CONSENT: 'ds.dataConsent',
};

export const DEFAULT_SETTINGS = {
  [STORAGE_KEYS.SIDEBAR_ENABLED]: true,
};
