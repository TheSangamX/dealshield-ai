import { useCallback, useEffect, useState } from 'react';
import { deleteDeal, getDeal, listDeals } from '../lib/api';

/**
 * The signed-in user's recent analyses (GET /api/deals), with loaders for one
 * saved result and deletion. deals: [{ id, subject, counterpart_name, counterpart_email, created_at }]
 */
export function useDeals(user) {
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setDeals([]);
      return;
    }
    try {
      setDeals(await listDeals());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const open = useCallback((id) => getDeal(id).then((deal) => deal.result), []);

  const remove = useCallback(async (id) => {
    await deleteDeal(id);
    setDeals((current) => current.filter((deal) => deal.id !== id));
  }, []);

  return { deals, error, refresh, open, remove };
}
