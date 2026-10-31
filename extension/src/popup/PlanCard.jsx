import { useState } from 'react';
import { Crown } from 'lucide-react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import { cancelPro, startProCheckout } from '../lib/api';
import { PRO_PRICE_LABEL } from '../utils/constants';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Upgrade (Free) or manage (Pro) the subscription. Hidden when billing isn't configured on the backend.
export default function PlanCard({ account, onChanged }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  if (!account || (account.plan === 'free' && !account.billingEnabled)) return null;

  const run = async (action) => {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  // Razorpay's hosted page opens in a new tab; the plan flips to Pro when its webhook arrives.
  const upgrade = () =>
    run(async () => {
      const { checkoutUrl } = await startProCheckout();
      chrome.tabs.create({ url: checkoutUrl });
    });

  const cancel = () =>
    run(async () => {
      await cancelPro();
      setConfirmingCancel(false);
      onChanged();
    });

  if (account.plan === 'free') {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Crown className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">Upgrade to Pro</p>
            <p className="text-xs text-slate-500">Unlimited analyses · {PRO_PRICE_LABEL}</p>
          </div>
          <Button size="sm" loading={pending} onClick={upgrade}>
            Upgrade
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </Card>
    );
  }

  const periodEnd = account.currentPeriodEnd ? formatDate(account.currentPeriodEnd) : null;

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Crown className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
            Pro plan <Badge tone="secondary">Unlimited</Badge>
          </p>
          <p className="text-xs text-slate-500">
            {account.cancelAtPeriodEnd
              ? `Cancelled · Pro until ${periodEnd ?? 'the end of this period'}`
              : periodEnd
                ? `Renews on ${periodEnd}`
                : 'Active'}
          </p>
        </div>
        {account.billingEnabled && !account.cancelAtPeriodEnd && !confirmingCancel && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmingCancel(true)}>
            Cancel
          </Button>
        )}
      </div>

      {confirmingCancel && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2.5 ring-1 ring-inset ring-slate-100">
          <p className="text-xs text-slate-600">Cancel at the end of this billing period?</p>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => setConfirmingCancel(false)}>
              Keep Pro
            </Button>
            <Button variant="outline" size="sm" loading={pending} onClick={cancel}>
              Yes, cancel
            </Button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </Card>
  );
}
