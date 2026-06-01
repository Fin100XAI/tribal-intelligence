import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

const VARIANTS = {
  danger: { wrap: 'bg-red-50 border-red-200 text-red-800', icon: AlertTriangle, iconColor: 'text-red-600' },
  warning: { wrap: 'bg-saffron-50 border-saffron-200 text-saffron-800', icon: AlertTriangle, iconColor: 'text-saffron-600' },
  info: { wrap: 'bg-govblue-50 border-govblue-200 text-govblue-800', icon: Info, iconColor: 'text-govblue-600' },
  compliance: { wrap: 'bg-emerald-50 border-emerald-100 text-emerald-800', icon: ShieldCheck, iconColor: 'text-emerald-600' },
};

export default function AlertBanner({ variant = 'info', title, children, action }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  const Icon = v.icon;
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${v.wrap}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${v.iconColor}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        <div className="text-xs sm:text-[13px] leading-relaxed opacity-90">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
