import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Inbox,
  LogOut,
  Mail,
  PanelRight,
  RefreshCw,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import AuthPanel from './AuthPanel';
import HistoryCard from './HistoryCard';
import PlanCard from './PlanCard';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import DataConsent from '../components/DataConsent';
import Logo from '../components/Logo';
import Toggle from '../components/Toggle';
import Strategies from '../sidebar/sections/Strategies';
import { useAccount } from '../hooks/useAccount';
import { useAuth } from '../hooks/useAuth';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useDataConsent } from '../hooks/useDataConsent';
import { useDeals } from '../hooks/useDeals';
import { useGmailThread } from '../hooks/useGmailThread';
import { useNegotiation } from '../hooks/useNegotiation';
import { MESSAGE_TYPES, hasChromeRuntime, sendToTab } from '../lib/messaging';
import { DEFAULT_SETTINGS, GMAIL_URL, STORAGE_KEYS } from '../utils/constants';

export default function Popup() {
  const { status, thread, tab, refresh } = useGmailThread();
  const auth = useAuth();
  const consent = useDataConsent();
  const { account, refresh: refreshAccount } = useAccount(auth.user);
  const deals = useDeals(auth.user);
  const { refresh: refreshDeals } = deals;
  const onAnalyzed = useCallback(() => {
    refreshAccount();
    refreshDeals();
  }, [refreshAccount, refreshDeals]);
  const negotiation = useNegotiation({ onSuccess: onAnalyzed });
  const { reset } = negotiation;

  useEffect(() => {
    reset();
  }, [thread?.threadId, auth.user?.id, reset]);

  const showAuth = auth.isConfigured && !auth.loading && !auth.user;
  // Insert needs the content script of the open Gmail thread.
  const insertIntoGmail =
    status === 'ready' && tab ? (text) => sendToTab(tab.id, { type: MESSAGE_TYPES.INSERT_DRAFT, text }) : undefined;

  return (
    <div className="flex w-[360px] flex-col bg-background">
      <Header live={status === 'ready'} />
      <main className="relative -mt-3 flex flex-col gap-3 px-4 pb-4">
        <EmailCard status={status} thread={thread} tab={tab} onRefresh={refresh} />
        {!consent.loading && !consent.granted && <DataConsent onAccept={consent.accept} />}
        {consent.granted && showAuth && <AuthPanel onSignIn={auth.signIn} onSignUp={auth.signUp} />}
        {consent.granted && status === 'ready' && auth.user && (
          <AnalysisPanel thread={thread} negotiation={negotiation} account={account} onInsert={insertIntoGmail} />
        )}
        {auth.user && <PlanCard account={account} onChanged={refreshAccount} />}
        {auth.user && (
          <HistoryCard deals={deals.deals} onOpen={deals.open} onRemove={deals.remove} onInsert={insertIntoGmail} />
        )}
        <SettingsCard />
      </main>
      <Footer auth={auth} account={account} />
    </div>
  );
}

function Header({ live }) {
  return (
    <header className="relative overflow-hidden bg-primary px-4 pb-6 pt-3 text-white">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-secondary/25 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <Logo variant="glass" className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-semibold tracking-tight">DealShield AI</h1>
          <p className="text-xs text-white/70">Negotiation copilot for Gmail</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-white/20">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-secondary' : 'bg-white/50'}`} />
          {live ? 'Live' : 'Idle'}
        </span>
      </div>
    </header>
  );
}

function EmailCard({ status, thread, tab, onRefresh }) {
  if (status === 'loading') return <EmailSkeleton />;

  if (status === 'not-gmail') {
    return (
      <EmptyState
        icon={Mail}
        title="Open Gmail to get started"
        description="DealShield works inside Gmail. Open an email thread and it will appear here."
        action={
          <Button size="sm" onClick={() => chrome.tabs.create({ url: GMAIL_URL })}>
            <ExternalLink className="h-3.5 w-3.5" />
            Open Gmail
          </Button>
        }
      />
    );
  }

  if (status === 'unavailable') {
    return (
      <EmptyState
        icon={RotateCw}
        title="Reload your Gmail tab"
        description="DealShield was installed or updated after this tab was opened."
        action={
          <Button size="sm" onClick={() => chrome.tabs.reload(tab.id)}>
            <RotateCw className="h-3.5 w-3.5" />
            Reload tab
          </Button>
        }
      />
    );
  }

  if (status === 'no-email') {
    return (
      <EmptyState
        icon={Inbox}
        title="No email open"
        description="Open an email thread in Gmail and its content will show up here."
        action={
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Check again
          </Button>
        }
      />
    );
  }

  return <ActiveEmail thread={thread} onRefresh={onRefresh} />;
}

function ActiveEmail({ thread, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, copy] = useCopyToClipboard();
  const latest = thread.messages.at(-1);
  const senderName = latest.sender.name || latest.sender.email || 'Unknown sender';
  const words = latest.body.split(/\s+/).filter(Boolean).length;
  const count = thread.messages.length;
  const isLong = latest.body.length > 220 || latest.body.split('\n').length > 5;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
          {senderName.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{senderName}</p>
          {latest.sender.email && <p className="truncate text-xs text-slate-500">{latest.sender.email}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh email" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <h2 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
        {thread.subject || '(no subject)'}
      </h2>
      {latest.date && <p className="mt-0.5 text-xs text-slate-400">{latest.date}</p>}

      <div className="mt-3 rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-100">
        <p
          className={`whitespace-pre-line text-[13px] leading-relaxed text-slate-600 ${expanded ? 'max-h-60 overflow-y-auto' : 'line-clamp-4'}`}
        >
          {latest.body}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            {expanded ? 'Show less' : 'Show more'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge tone="primary">
          {count} {count === 1 ? 'message' : 'messages'}
        </Badge>
        <Badge>{words} words</Badge>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => copy(latest.body)}>
          {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Card>
  );
}

function AnalysisPanel({ thread, negotiation, account, onInsert }) {
  const { status, result, error, analyze } = negotiation;
  const outOfQuota = account?.remaining === 0;

  return (
    <>
      <div>
        <Button
          size="lg"
          className="w-full"
          disabled={outOfQuota}
          loading={status === 'loading'}
          onClick={() => analyze(thread)}
        >
          {status !== 'loading' && <Sparkles className="h-4 w-4" />}
          {status === 'loading' ? 'Analyzing…' : result ? 'Re-analyze' : 'Analyze negotiation'}
        </Button>
        {account && <UsageLine account={account} />}
      </div>

      {error && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Strategies result={result} onInsert={onInsert} />
    </>
  );
}

function UsageLine({ account }) {
  if (account.limit === null) {
    return <p className="mt-1.5 text-center text-[11px] text-slate-500">Pro plan · unlimited analyses</p>;
  }
  const outOfQuota = account.remaining === 0;
  return (
    <p className={`mt-1.5 text-center text-[11px] ${outOfQuota ? 'text-rose-600' : 'text-slate-500'}`}>
      {outOfQuota
        ? `All ${account.limit} free analyses used this month. Upgrade to Pro for unlimited.`
        : `${account.remaining} of ${account.limit} free analyses left this month`}
    </p>
  );
}

function SettingsCard() {
  const [enabled, setEnabled] = useSidebarSetting();

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <PanelRight className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Gmail sidebar</p>
          <p className="text-xs text-slate-500">Show the negotiation panel in threads</p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} label="Show Gmail sidebar" />
      </div>
    </Card>
  );
}

function useSidebarSetting() {
  const key = STORAGE_KEYS.SIDEBAR_ENABLED;
  const [enabled, setEnabled] = useState(DEFAULT_SETTINGS[key]);

  useEffect(() => {
    if (!hasChromeRuntime()) return;
    chrome.storage.local.get(key).then((stored) => setEnabled(stored[key] ?? DEFAULT_SETTINGS[key]));
  }, [key]);

  const update = (value) => {
    setEnabled(value);
    if (hasChromeRuntime()) chrome.storage.local.set({ [key]: value });
  };

  return [enabled, update];
}

function Footer({ auth, account }) {
  const { user, loading, isConfigured, signOut } = auth;
  const version = hasChromeRuntime() ? chrome.runtime.getManifest().version : 'dev';

  let label = 'Not signed in';
  if (!isConfigured) label = 'Supabase not configured';
  else if (loading) label = 'Checking account…';
  else if (user) label = user.email;

  return (
    <footer className="flex items-center justify-between gap-2 border-t border-slate-200/80 bg-white px-4 py-2 text-[11px] text-slate-500">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${user ? 'bg-secondary' : 'bg-slate-300'}`} />
        <span className="truncate">{label}</span>
        {account && (
          <Badge tone={account.plan === 'pro' ? 'primary' : 'neutral'} className="shrink-0 capitalize">
            {account.plan}
          </Badge>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {user && (
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
        <span>v{version}</span>
      </span>
    </footer>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">{description}</p>
      <div className="mt-4 flex justify-center">{action}</div>
    </Card>
  );
}

function EmailSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-2.5 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-3.5 w-3/4 rounded bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-100" />
      </div>
    </Card>
  );
}
