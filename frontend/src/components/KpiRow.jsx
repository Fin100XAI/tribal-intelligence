import KpiCard from './ui/KpiCard.jsx';

// Renders a responsive grid of KPI cards from the backend `kpis` array.
// `icons` maps kpi.key → lucide icon. Metrics with tone warning/danger treat
// a downward trend as good (fewer failures = better).
export default function KpiRow({ kpis = [], icons = {}, onCardClick, cols = 4 }) {
  const colClass =
    cols === 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : cols === 3
      ? 'grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-4';
  return (
    <div className={`grid ${colClass} gap-3`}>
      {kpis.map((k) => (
        <KpiCard
          key={k.key}
          label={k.label}
          value={k.value}
          format={k.format}
          trend={k.trend}
          sub={k.sub}
          tone={k.tone}
          icon={icons[k.key]}
          trendGood={!(k.tone === 'warning' || k.tone === 'danger')}
          onClick={onCardClick ? () => onCardClick(k) : undefined}
        />
      ))}
    </div>
  );
}
