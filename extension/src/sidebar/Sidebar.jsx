import { useEffect, useState } from 'react';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import DealSummary from './sections/DealSummary';
import Strategies from './sections/Strategies';
import { useNegotiation } from '../hooks/useNegotiation';

// Above Gmail's own overlays.
const Z_TOP = 'z-[2147483000]';

export default function Sidebar({ thread }) {
  const [open, setOpen] = useState(false);
  const { status, result, error, errorCode, analyze, reset } = useNegotiation();

  useEffect(() => {
    reset();
  }, [thread?.threadId, reset]);

  if (!open) {
    if (!thread) return null;
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Open DealShield AI"
        className={`fixed right-0 top-1/2 ${Z_TOP} -translate-y-1/2 rounded-l-xl bg-primary p-2 pr-2.5 shadow-lg shadow-primary/30 transition hover:pr-3.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30`}
      >
        <Logo variant="glass" className="h-7 w-7" />
      </button>
    );
  }

  return (
    <aside
      className={`fixed bottom-4 right-4 top-[72px] ${Z_TOP} flex w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-background shadow-2xl shadow-slate-900/15`}
    >
      <header className="relative flex items-center gap-2.5 overflow-hidden bg-primary px-4 py-3 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <Logo variant="glass" className="h-8 w-8" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight">DealShield AI</h2>
          <p className="text-[11px] text-white/70">Negotiation copilot</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <DealSummary thread={thread} />

        <Button
          size="lg"
          className="w-full"
          disabled={!thread}
          loading={status === 'loading'}
          onClick={() => analyze(thread)}
        >
          {status !== 'loading' && <Sparkles className="h-4 w-4" />}
          {status === 'loading' ? 'Analyzing…' : result ? 'Re-analyze' : 'Analyze negotiation'}
        </Button>

        {error && (
          <div
            role="alert"
            className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {error}
              {errorCode === 'UNAUTHENTICATED' && ' Click the DealShield icon in your browser toolbar to sign in.'}
            </span>
          </div>
        )}

        <Strategies result={result} />
      </div>
    </aside>
  );
}
