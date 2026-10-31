import { useState } from 'react';
import { AlertCircle, LogIn, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const INPUT_CLASS =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';

// Email + password sign-in / sign-up (Supabase Auth).
export default function AuthPanel({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const isSignUp = mode === 'signup';

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = isSignUp ? await onSignUp(email, password) : await onSignIn(email, password);
    setPending(false);
    if (result.error) setError(result.error.message);
    else if (result.needsConfirmation) setConfirmSent(true);
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setError(null);
  };

  if (confirmSent) {
    return (
      <Card className="text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <MailCheck className="h-5 w-5" />
        </span>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">Check your inbox</h2>
        <p className="mx-auto mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
          We sent a confirmation link to <span className="font-medium text-slate-700">{email}</span>. Confirm it, then
          sign in here.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setConfirmSent(false);
            setMode('signin');
          }}
        >
          Back to sign in
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-900">
        {isSignUp ? 'Create your DealShield account' : 'Sign in to DealShield'}
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">
        {isSignUp ? 'Free plan includes monthly negotiation analyses.' : 'Sign in to analyze negotiations.'}
      </p>

      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={INPUT_CLASS}
        />

        {error && (
          <p role="alert" className="flex items-start gap-1.5 text-xs text-rose-600">
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" loading={pending}>
          {!pending && <LogIn className="h-4 w-4" />}
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-slate-500">
        {isSignUp ? 'Already have an account?' : 'New to DealShield?'}{' '}
        <button type="button" onClick={switchMode} className="font-medium text-primary hover:text-primary/80">
          {isSignUp ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </Card>
  );
}
