export const MESSAGE_TYPES = {
  GET_THREAD: 'DS_GET_THREAD', // popup → content script
  INSERT_DRAFT: 'DS_INSERT_DRAFT', // popup → content script
  THREAD_UPDATED: 'DS_THREAD_UPDATED', // content script → popup
  API_REQUEST: 'DS_API_REQUEST', // popup / content script → background
};

// False when the UI runs outside the extension (e.g. `npm run dev:ui`).
export const hasChromeRuntime = () =>
  typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);

export function sendToBackground(message) {
  return chrome.runtime.sendMessage(message);
}

export function sendToTab(tabId, message) {
  return chrome.tabs.sendMessage(tabId, message);
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}
