import { useState } from 'react';
import { ArrowLeftRight, Check, Copy, Shield, Timer } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

const STRATEGIES = [
  { key: 'firmOffer', label: 'Firm offer', icon: Shield },
  { key: 'creativeTradeoff', label: 'Trade-off', icon: ArrowLeftRight },
  { key: 'urgencyDraft', label: 'Urgency', icon: Timer },
];

// Tabs for the three reply strategies returned by POST /api/analyze.
export default function Strategies({ result }) {
  const [active, setActive] = useState(STRATEGIES[0].key);
  const [copied, copy] = useCopyToClipboard();
  if (!result) return null;

  const strategy = result[active];

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
              <Button variant="ghost" size="sm" className="h-7" onClick={() => copy(strategy.draft)}>
                {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="max-h-64 overflow-y-auto whitespace-pre-line p-3 text-[13px] leading-relaxed text-slate-700">
              {strategy.draft}
            </p>
          </div>
          <p className="text-[11px] leading-snug text-slate-400">
            AI draft: fill in the [brackets] and check dates, prices and promises before sending.
          </p>
        </div>
      )}
    </Card>
  );
}
