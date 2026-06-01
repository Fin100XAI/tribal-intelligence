// Generic content card with an optional header (title, icon, action slot).
export default function Card({ title, subtitle, icon: Icon, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`gov-card overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-ink-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {Icon && (
                <span className="grid place-items-center h-7 w-7 rounded-lg bg-govblue-50 text-govblue-700 shrink-0">
                  <Icon size={15} />
                </span>
              )}
              <h3 className="section-title truncate">{title}</h3>
            </div>
            {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`p-4 sm:p-5 ${bodyClass}`}>{children}</div>
    </section>
  );
}
