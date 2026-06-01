import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ComposedChart,
} from 'recharts';
import { CHART_SERIES, PALETTE, compactNumber } from '../../lib/format.js';

const axisStyle = { fontSize: 11, fill: '#94a3b8' };
const grid = '#eef2f7';

function GovTooltip({ active, payload, label, valueFmt }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-cardhover text-xs">
      {label !== undefined && <p className="font-semibold text-ink-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-ink-500 capitalize">{p.name}</span>
          <span className="ml-auto font-semibold text-ink-800 tabular-nums">
            {valueFmt ? valueFmt(p.value) : compactNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrendLine({ data, lines, height = 240, valueFmt }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={compactNumber} />
        <Tooltip content={<GovTooltip valueFmt={valueFmt} />} />
        {lines.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name}
            stroke={l.color || CHART_SERIES[i % CHART_SERIES.length]}
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendArea({ data, xKey = 'month', areas, height = 240, stacked = false, valueFmt }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {areas.map((a, i) => {
            const c = a.color || CHART_SERIES[i % CHART_SERIES.length];
            return (
              <linearGradient key={a.key} id={`grad-${a.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c} stopOpacity={0.35} />
                <stop offset="95%" stopColor={c} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={compactNumber} />
        <Tooltip content={<GovTooltip valueFmt={valueFmt} />} />
        {areas.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
        {areas.map((a, i) => {
          const c = a.color || CHART_SERIES[i % CHART_SERIES.length];
          return (
            <Area
              key={a.key}
              type="monotone"
              dataKey={a.key}
              name={a.name}
              stackId={stacked ? '1' : undefined}
              stroke={c}
              strokeWidth={2}
              fill={`url(#grad-${a.key})`}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, xKey, bars, height = 260, layout = 'horizontal', valueFmt, stacked = false }) {
  const vertical = layout === 'vertical';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={vertical ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 12, left: vertical ? 8 : -16, bottom: 0 }}
        barCategoryGap={vertical ? '22%' : '28%'}
      >
        <CartesianGrid stroke={grid} vertical={vertical} horizontal={!vertical} />
        {vertical ? (
          <>
            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={compactNumber} />
            <YAxis type="category" dataKey={xKey} tick={{ ...axisStyle, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} interval={0} angle={data.length > 7 ? -25 : 0} textAnchor={data.length > 7 ? 'end' : 'middle'} height={data.length > 7 ? 50 : 30} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={compactNumber} />
          </>
        )}
        <Tooltip content={<GovTooltip valueFmt={valueFmt} />} cursor={{ fill: '#f1f5f9' }} />
        {bars.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            stackId={stacked ? '1' : undefined}
            fill={b.color || CHART_SERIES[i % CHART_SERIES.length]}
            radius={stacked ? 0 : vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            maxBarSize={vertical ? 22 : 46}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, nameKey = 'label', valueKey = 'value', height = 240, colors, centerLabel }) {
  const palette = colors || CHART_SERIES;
  const total = data.reduce((a, d) => a + d[valueKey], 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<GovTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ height }}>
          <span className="text-xl font-bold text-ink-800 tabular-nums">{centerLabel.value ?? compactNumber(total)}</span>
          <span className="text-[11px] text-ink-400">{centerLabel.label}</span>
        </div>
      )}
    </div>
  );
}

export function Gauge({ value, max = 100, label, color = PALETTE.blue, height = 180 }) {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={210} endAngle={-30}>
          <RadialBar background={{ fill: '#eef2f7' }} dataKey="value" cornerRadius={10} max={max} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-ink-800 tabular-nums">{value}</span>
        {label && <span className="text-[11px] text-ink-400 mt-0.5 text-center px-4">{label}</span>}
      </div>
    </div>
  );
}

export function ComboChart({ data, xKey = 'month', bars = [], lines = [], height = 260, valueFmt }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={compactNumber} />
        <Tooltip content={<GovTooltip valueFmt={valueFmt} />} cursor={{ fill: '#f1f5f9' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color || CHART_SERIES[i % CHART_SERIES.length]} radius={[5, 5, 0, 0]} maxBarSize={36} />
        ))}
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color || PALETTE.saffron} strokeWidth={2.4} dot={false} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Horizontal progress/funnel bar list — used for the welfare funnel & coverage.
export function FunnelBars({ data, color = PALETTE.blue }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const dropoff = i > 0 ? ((d.value / data[i - 1].value) * 100).toFixed(1) : null;
        return (
          <div key={d.stage}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-ink-600">{d.stage}</span>
              <span className="tabular-nums text-ink-700 font-semibold">
                {compactNumber(d.value)}
                {dropoff && <span className="ml-2 text-ink-400 font-normal">{dropoff}% →</span>}
              </span>
            </div>
            <div className="h-7 rounded-lg bg-ink-50 overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center justify-end pr-2 text-[10px] font-semibold text-white transition-all"
                style={{ width: `${Math.max(pct, 8)}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
