import { useCallback, useState } from 'react';
import { analyzeThread } from '../lib/api';

const IDLE = { status: 'idle', result: null, error: null, errorCode: null };

/**
 * Runs a negotiation analysis for a thread via the backend.
 * result (POST /api/analyze): { firmOffer, creativeTradeoff, urgencyDraft },
 * each { headline, psychology, draft }; creativeTradeoff also has { give, get }.
 */
export function useNegotiation({ onSuccess } = {}) {
  const [state, setState] = useState(IDLE);

  const analyze = useCallback(
    async (thread) => {
      if (!thread) return;
      setState({ ...IDLE, status: 'loading' });
      try {
        const result = await analyzeThread(thread);
        setState({ ...IDLE, status: 'success', result });
        onSuccess?.(result);
      } catch (err) {
        setState({ ...IDLE, status: 'error', error: err.message, errorCode: err.code ?? null });
      }
    },
    [onSuccess],
  );

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, analyze, reset };
}
