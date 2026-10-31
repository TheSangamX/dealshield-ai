import { useState } from 'react';
import { ArrowLeftRight, Check, Copy, CornerDownLeft, Shield, Timer } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

const STRATEGIES = [
  { key: 'firmOffer', label: 'Firm offer', icon: Shield },
  { key: 'creativeTradeoff', label: 'Trade-off', icon: ArrowLeftRight },
  { key: 'urgencyDraft', label: 'Urgency', icon: Timer },
];

// Tabs for the three reply strategies returned by POST /api/analyze.
// onInsert(text) → Promise<{ ok, error }> adds an "Insert" button that puts the draft into Gmail.
export default function Strategies({ result, onInsert }) {
  const [active, setActive] = useState(STRATEGIES[0].key);
  const [copied, copy] = useCopyToClipboard();
  const [insertState, setInsertState] = useState({ status: 'idle', error: null });
  if (!result) return null;

  const strategy = result[active];

  const insert = async () => {
    setInsertState({ status: 'pending', error: null });
    try {
      const response = await onInsert(strategy.draft);
      setInsertState(response?.ok ? { status: 'done', error: null } : { status: 'error', error: response?.error });
    } catch {
      setInsertState({ status: 'error', error: 'Reload the Gmail tab and try again.' });
    }
  };

  return (
    <Card className="p-0">
      <div role="tablist" className="flex gap-1 border-b border-slate-100 p-1.5">
        {STRATEGIES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
              active === key ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {strategy && (
        <div role="tabpanel" className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold leading-snug text-slate-900">{strategy.headline}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{strategy.psychology}</p>
          </div>

          {active === 'creativeTradeoff' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-inset ring-slate-100">
                <p className="font-semibold uppercase tracking-wider text-slate-400">We give</p>
                <p className="mt-1 text-slate-700">{strategy.give}</p>
              </div>
              <div className="rounded-lg bg-secondary/10 p-2.5 ring-1 ring-inset ring-secondary/20">
                <p className="font-semibold uppercase tracking-wider text-emerald-700">We get</p>
                <p className="mt-1 text-slate-700">{strategy.get}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Draft reply</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7" onClick={() => copy(strategy.draft)}>
                  {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                {onInsert && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    loading={insertState.status === 'pending'}
                    onClick={insert}
                    title="Put this draft into Gmail's reply box"
                  >
                    {insertState.status === 'done' ? (
                      <Check className="h-3.5 w-3.5 text-secondary" />
                    ) : (
                      insertState.status !== 'pending' && <CornerDownLeft className="h-3.5 w-3.5" />
                    )}
                    {insertState.status === 'done' ? 'Inserted' : 'Insert'}
                  </Button>
                )}
              </div>
            </div>
            <p className="max-h-64 overflow-y-auto whitespace-pre-line p-3 text-[13px] leading-relaxed text-slate-700">
              {strategy.draft}
            </p>
          </div>
          {insertState.status === 'error' && (
            <p role="alert" className="text-xs text-rose-600">
              {insertState.error}
            </p>
          )}
          <p className="text-[11px] leading-snug text-slate-400">
            AI draft: fill in the [brackets] and check dates, prices and promises before sending.
          </p>
        </div>
      )}
    </Card>
  );
}
