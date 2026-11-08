import { useCallback, useEffect, useState } from 'react';
import { hasChromeRuntime } from '../lib/messaging';
import { STORAGE_KEYS } from '../utils/constants';

const KEY = STORAGE_KEYS.DATA_CONSENT;

/**
 * Whether the user has agreed to the data disclosure. Required before sign-up or
 * Analyze (Chrome Web Store prominent disclosure policy). Shared by popup and sidebar.
 */
export function useDataConsent() {
  const [state, setState] = useState({ loading: hasChromeRuntime(), granted: false });

  useEffect(() => {
    if (!hasChromeRuntime()) return;
    chrome.storage.local.get(KEY).then((stored) => setState({ loading: false, granted: stored[KEY] === true }));

    const onChanged = (changes, area) => {
      if (area === 'local' && KEY in changes) setState({ loading: false, granted: changes[KEY].newValue === true });
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  }, []);

  const accept = useCallback(() => {
    setState({ loading: false, granted: true });
    if (hasChromeRuntime()) chrome.storage.local.set({ [KEY]: true });
  }, []);

  return { ...state, accept };
}
