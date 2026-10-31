import { MESSAGE_TYPES, hasChromeRuntime, sendToBackground } from './messaging';

/**
 * Calls the backend through the background worker, which attaches the
 * Supabase JWT. Content scripts can't call the backend directly (Gmail's CORS).
 * Resolves with the response's `data`; throws an Error with the backend's
 * message and `code` (e.g. UNAUTHENTICATED, QUOTA_EXCEEDED).
 */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  if (!hasChromeRuntime()) {
    throw new Error('The backend is only reachable from the installed extension.');
  }
  const response = await sendToBackground({ type: MESSAGE_TYPES.API_REQUEST, path, method, body });
  if (!response?.ok) {
    const error = new Error(response?.error?.message ?? 'Request failed.');
    error.code = response?.error?.code;
    throw error;
  }
  return response.data;
}

// → { firmOffer, creativeTradeoff, urgencyDraft }
export const analyzeThread = (thread) =>
  apiRequest('/api/analyze', { method: 'POST', body: { thread } });

// → { user, account: { plan, status, limit, used, remaining } }
export const getMe = () => apiRequest('/api/me');
