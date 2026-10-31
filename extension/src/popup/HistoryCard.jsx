import { useState } from 'react';
import { ChevronDown, History, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Strategies from '../sidebar/sections/Strategies';

const COLLAPSED_COUNT = 3;

const formatWhen = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

// Recent analyses; clicking one reopens its saved strategies.
export default function HistoryCard({ deals, onOpen, onRemove, onInsert }) {
  const [openId, setOpenId] = useState(null);
  const [openResult, setOpenResult] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  if (!deals.length) return null;
  const visible = showAll ? deals : deals.slice(0, COLLAPSED_COUNT);

  const toggle = async (id) => {
    setError(null);
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setBusyId(id);
    try {
      setOpenResult(await onOpen(id));
      setOpenId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setError(null);
    try {
      await onRemove(id);
      if (openId === id) setOpenId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card title="Recent analyses" icon={History} className="p-3">
      <ul className="-mx-1 divide-y divide-slate-100">
        {visible.map((deal) => (
          <li key={deal.id} className="py-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggle(deal.id)}
                aria-expanded={openId === deal.id}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1.5 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-slate-800">{deal.subject || '(no subject)'}</p>
                  <p className="truncate text-[11px] text-slate-500">
                    {[deal.counterpart_name || deal.counterpart_email, formatWhen(deal.created_at)]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                {busyId === deal.id ? (
                  <Spinner className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${openId === deal.id ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(deal.id)}
                title="Delete from history"
                aria-label="Delete from history"
                className="rounded-md p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {openId === deal.id && openResult && (
              <div className="px-1 pb-1 pt-2">
                <Strategies result={openResult} onInsert={onInsert} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {deals.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="mt-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          {showAll ? 'Show less' : `Show all (${deals.length})`}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </Card>
  );
}
