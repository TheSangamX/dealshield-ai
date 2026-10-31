import { parseOpenThread } from './gmail-parser';

const signatureOf = (thread) =>
  thread
    ? `${thread.threadId}|${thread.messages.map((m) => `${m.id}:${m.body.length}`).join(',')}`
    : 'none';

/**
 * Watches Gmail (a single-page app) for thread changes and keeps the parsed
 * thread in a small store. Compatible with React's useSyncExternalStore.
 */
export function createGmailObserver({ delayMs = 300 } = {}) {
  let thread = parseOpenThread();
  let signature = signatureOf(thread);
  let timer = null;
  const listeners = new Set();

  const refresh = () => {
    const next = parseOpenThread();
    const nextSignature = signatureOf(next);
    if (nextSignature !== signature) {
      thread = next;
      signature = nextSignature;
      listeners.forEach((listener) => listener());
    }
    return thread;
  };

  // Gmail mutates the DOM constantly; re-parse at most once per delay window.
  const schedule = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      refresh();
    }, delayMs);
  };

  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', schedule);

  return {
    getThread: () => thread,
    refresh,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    disconnect() {
      mutationObserver.disconnect();
      window.removeEventListener('hashchange', schedule);
      clearTimeout(timer);
      listeners.clear();
    },
  };
}
