const VARIANTS = {
  solid: 'bg-primary text-white shadow-sm shadow-primary/30',
  glass: 'bg-white/15 text-white ring-1 ring-inset ring-white/25',
};

export default function Logo({ variant = 'solid', className = 'h-9 w-9' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-xl ${VARIANTS[variant]} ${className}`}>
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" aria-hidden="true">
        <path
          d="M12 2.75 19.25 5.5v5.75c0 4.6-3.05 8.55-7.25 10-4.2-1.45-7.25-5.4-7.25-10V5.5L12 2.75Z"
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="m8.75 12 2.25 2.25 4.25-4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
