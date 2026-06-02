import { MapContainer, CircleMarker, Tooltip as LTooltip, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { riskColor } from '../lib/format.js';

// Maharashtra approx bounds for fit
const MH_CENTER = [19.7, 76.5];

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length) {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      const bounds = [
        [Math.min(...lats) - 0.4, Math.min(...lngs) - 0.4],
        [Math.max(...lats) + 0.4, Math.max(...lngs) + 0.4],
      ];
      map.fitBounds(bounds, { padding: [24, 24] });
    }
    setTimeout(() => map.invalidateSize(), 200);
  }, [points, map]);
  return null;
}

function radiusFor(score) {
  // 0-100 → 8-22 px
  return 8 + (Math.min(100, Math.max(0, score)) / 100) * 14;
}

// points: [{ id, name, lat, lng, score, band, district, ...extra }]
export default function MahaMap({ points = [], height = 420, valueLabel = 'Risk Score', onSelect, renderTooltip }) {
  return (
    <div className="maha-map rounded-2xl overflow-hidden border border-ink-100" style={{ height }}>
      {/* No external tile server — fully self-contained styled backdrop. */}
      <MapContainer center={MH_CENTER} zoom={6} scrollWheelZoom={false} attributionControl={false} style={{ height: '100%', width: '100%' }}>
        <FitBounds points={points} />
        {points.map((p) => {
          const c = riskColor(p.band);
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={radiusFor(p.score)}
              pathOptions={{ color: c.hex, fillColor: c.hex, fillOpacity: 0.45, weight: 1.5 }}
              eventHandlers={onSelect ? { click: () => onSelect(p) } : undefined}
            >
              <LTooltip direction="top" offset={[0, -4]} opacity={1}>
                {renderTooltip ? (
                  renderTooltip(p)
                ) : (
                  <div className="text-xs">
                    <p className="font-semibold text-ink-800">{p.name}</p>
                    {p.district && p.district !== p.name && <p className="text-ink-400">{p.district}</p>}
                    <p className="mt-0.5">
                      {valueLabel}: <span className="font-semibold" style={{ color: c.hex }}>{p.score}</span> · {p.band}
                    </p>
                  </div>
                )}
              </LTooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// Compact legend shared by map cards.
export function MapLegend() {
  const bands = ['Critical', 'High', 'Moderate', 'Watch', 'Stable'];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-500">
      {bands.map((b) => {
        const c = riskColor(b);
        return (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.hex, opacity: 0.7 }} />
            {b}
          </span>
        );
      })}
      <span className="text-ink-300">· bubble size = intensity</span>
    </div>
  );
}
