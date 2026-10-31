// Emerald text uses emerald-700: the secondary token is too light for small text on white.
const TONES = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  secondary: 'bg-secondary/10 text-emerald-700 ring-secondary/25',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const DOTS = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  neutral: 'bg-slate-400',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
};

export default function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[tone]}`} />}
      {children}
    </span>
  );
}
