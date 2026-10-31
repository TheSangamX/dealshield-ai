import { useCallback, useEffect, useState } from 'react';
import { getMe } from '../lib/api';

/**
 * Plan and monthly usage for the signed-in user, from GET /api/me.
 * account: { plan: 'free'|'pro', status, limit (null = unlimited), used, remaining }
 */
export function useAccount(user) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setAccount(null);
      return;
    }
    try {
      const data = await getMe();
      setAccount(data.account);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { account, error, refresh };
}
