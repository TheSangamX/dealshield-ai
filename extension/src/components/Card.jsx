export default function Card({ title, icon: Icon, action, className = '', children }) {
  return (
    <section
      className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.03] ${className}`}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title && (
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
          )}
          {action && <div className="ml-auto">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
