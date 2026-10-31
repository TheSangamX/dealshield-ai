import { insertDraft } from './gmail-composer';
import { createGmailObserver } from './gmail-observer';
import { mountSidebar } from './inject';
import { MESSAGE_TYPES } from '../lib/messaging';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

const observer = createGmailObserver();

// Push thread changes to an open popup so it updates live.
observer.subscribe(() => {
  try {
    chrome.runtime
      .sendMessage({ type: MESSAGE_TYPES.THREAD_UPDATED, thread: observer.getThread() })
      .catch(() => {}); // no popup open
  } catch {
    observer.disconnect(); // extension was reloaded; this script is orphaned
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE_TYPES.GET_THREAD) {
    sendResponse({ thread: observer.refresh() });
  } else if (message?.type === MESSAGE_TYPES.INSERT_DRAFT) {
    insertDraft(message.text).then(sendResponse);
    return true; // async response
  }
  return false;
});

// Sidebar visibility follows the setting the popup toggles.
const sidebarKey = STORAGE_KEYS.SIDEBAR_ENABLED;
let unmountSidebar = null;

function setSidebarEnabled(enabled) {
  if (enabled && !unmountSidebar) {
    unmountSidebar = mountSidebar(observer);
  } else if (!enabled && unmountSidebar) {
    unmountSidebar();
    unmountSidebar = null;
  }
}

chrome.storage.local
  .get(sidebarKey)
  .then((stored) => setSidebarEnabled(stored[sidebarKey] ?? DEFAULT_SETTINGS[sidebarKey]));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && sidebarKey in changes) {
    setSidebarEnabled(changes[sidebarKey].newValue);
  }
});
