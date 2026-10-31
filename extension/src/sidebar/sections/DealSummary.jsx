import { Handshake } from 'lucide-react';
import Card from '../../components/Card';

export default function DealSummary({ thread }) {
  const latest = thread?.messages.at(-1);
  const count = thread?.messages.length ?? 0;

  return (
    <Card title="Deal summary" icon={Handshake}>
      {thread ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-snug text-slate-900">{thread.subject || '(no subject)'}</p>
          <p className="text-xs text-slate-500">
            With {latest.sender.name || latest.sender.email} · {count} {count === 1 ? 'message' : 'messages'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Open an email thread to start.</p>
      )}
    </Card>
  );
}
