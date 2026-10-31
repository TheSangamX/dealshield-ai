import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Service workers have no localStorage, so sessions persist in chrome.storage
// and are shared between the popup and the background worker.
const chromeStorage = {
  getItem: async (key) => (await chrome.storage.local.get(key))[key] ?? null,
  setItem: (key, value) => chrome.storage.local.set({ [key]: value }),
  removeItem: (key) => chrome.storage.local.remove(key),
};

const hasChromeStorage = typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

// null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          storage: hasChromeStorage ? chromeStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;
