import { supabase } from '../lib/supabase';
import { MESSAGE_TYPES } from '../lib/messaging';
import { API_URL, DEFAULT_SETTINGS } from '../utils/constants';

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
  await chrome.storage.local.set({ ...DEFAULT_SETTINGS, ...stored });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== MESSAGE_TYPES.API_REQUEST) return false;
  relayApiRequest(message).then(sendResponse);
  return true; // keep the channel open for the async response
});

// getSession() refreshes an expired access token before returning it.
async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function relayApiRequest({ path, method = 'GET', body }) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: json?.error ?? { message: `Request failed (${res.status}).` } };
    }
    return { ok: true, data: json?.data ?? null };
  } catch {
    return {
      ok: false,
      error: { message: 'Could not reach the DealShield backend.', code: 'NETWORK_ERROR' },
    };
  }
}
