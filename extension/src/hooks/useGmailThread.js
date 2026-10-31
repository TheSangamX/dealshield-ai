import { useCallback, useEffect, useState } from 'react';
import { MESSAGE_TYPES, getActiveTab, hasChromeRuntime, sendToTab } from '../lib/messaging';
import { GMAIL_URL } from '../utils/constants';

// Shown when the popup runs outside the extension (`npm run dev:ui`).
const PREVIEW_THREAD = {
  threadId: 'preview',
  subject: 'Re: Annual plan pricing for 40 seats',
  url: '',
  messages: [
    {
      id: 'preview-1',
      sender: { name: 'Jordan Lee', email: 'jordan.lee@acme.co' },
      to: [],
      date: 'Fri, Oct 30, 2026, 4:12 PM',
      body:
        'Hi,\n\nThanks for the updated proposal. We like the platform, but $48/seat is above what we budgeted for this year. Another vendor quoted us $39/seat for a similar package.\n\nIf you can match that and include onboarding at no extra cost, we can sign before the end of the quarter.\n\nBest,\nJordan',
    },
  ],
  capturedAt: '',
};

/**
 * Popup-side view of the Gmail thread open in the active tab.
 * status: 'loading' | 'ready' | 'no-email' | 'not-gmail' | 'unavailable'
 * ('unavailable' = Gmail tab has no content script yet, e.g. opened before install)
 */
export function useGmailThread() {
  const inExtension = hasChromeRuntime();
  const [state, setState] = useState(
    inExtension
      ? { status: 'loading', thread: null, tab: null }
      : { status: 'ready', thread: PREVIEW_THREAD, tab: null },
  );

  const refresh = useCallback(async () => {
    if (!hasChromeRuntime()) return;
    const tab = await getActiveTab();
    if (!tab?.url?.startsWith(GMAIL_URL)) {
      setState({ status: 'not-gmail', thread: null, tab });
      return;
    }
    try {
      const response = await sendToTab(tab.id, { type: MESSAGE_TYPES.GET_THREAD });
      const thread = response?.thread ?? null;
      setState({ status: thread ? 'ready' : 'no-email', thread, tab });
    } catch {
      setState({ status: 'unavailable', thread: null, tab });
    }
  }, []);

  useEffect(() => {
    if (!hasChromeRuntime()) return;
    refresh();

    const onMessage = (message, sender) => {
      if (message?.type !== MESSAGE_TYPES.THREAD_UPDATED) return;
      setState((prev) =>
        prev.tab && sender.tab?.id === prev.tab.id
          ? { ...prev, status: message.thread ? 'ready' : 'no-email', thread: message.thread }
          : prev,
      );
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [refresh]);

  return { ...state, refresh };
}
