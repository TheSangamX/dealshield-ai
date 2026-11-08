import { ShieldCheck } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { PRIVACY_URL } from '../utils/constants';

// Prominent disclosure and affirmative consent, shown before any user data leaves the browser.
export default function DataConsent({ onAccept }) {
  return (
    <Card title="Before you start" icon={ShieldCheck}>
      <p className="text-[13px] font-medium leading-snug text-slate-900">How DealShield uses your data</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-600">
        <li>
          When you click <strong>Analyze negotiation</strong>, the open email thread (subject, names and email
          addresses of the people on it, dates and message text) is sent to our server and to Groq, our AI provider,
          to write reply drafts.
        </li>
        <li>
          We save the subject, the other person's name and email, and the drafts in your history. The email text is
          not saved.
        </li>
        <li>We also store your account email, plan and monthly usage.</li>
        <li>Nothing is sent until you click Analyze. We never sell your data or use it for ads.</li>
      </ul>
      <Button className="mt-3 w-full" onClick={onAccept}>
        I agree and continue
      </Button>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Read our{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
          privacy policy
        </a>
      </p>
    </Card>
  );
}
