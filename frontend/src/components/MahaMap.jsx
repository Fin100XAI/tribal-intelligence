import { MapContainer, CircleMarker, Polygon, Tooltip as LTooltip, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { riskColor } from '../lib/format.js';
import { MAHARASHTRA_OUTLINE } from '../data/maharashtra.js';

const MH_CENTER = [19.3, 76.6];
const MH_BOUNDS = [
  [15.4, 72.4],
  [22.2, 80.9],
];

function FitState() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(MH_BOUNDS, { padding: [12, 12] });
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function radiusFor(score) {
  return 7 + (Math.min(100, Math.max(0, score)) / 100) * 15;
}

// points: [{ id, name, lat, lng, score, band, district, ...extra }]
export default function MahaMap({ points = [], height = 420, valueLabel = 'Risk Score', onSelect, renderTooltip }) {
  return (
    <div className="maha-map rounded-2xl overflow-hidden border border-ink-100 relative" style={{ height }}>
      <MapContainer
        center={MH_CENTER}
        zoom={6}
        minZoom={5}
        maxZoom={9}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        <FitState />

        {/* Maharashtra silhouette — embedded, no external tiles */}
        <Polygon
          positions={MAHARASHTRA_OUTLINE}
          pathOptions={{ color: '#94a3b8', weight: 1.5, fillColor: '#dbe6f3', fillOpacity: 0.7 }}
        />

        {points.map((p) => {
          const c = riskColor(p.band);
          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={radiusFor(p.score)}
              pathOptions={{ color: '#fff', fillColor: c.hex, fillOpacity: 0.82, weight: 1.5 }}
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
      <span className="absolute bottom-2 right-2.5 z-[400] text-[10px] font-medium text-ink-400 bg-white/70 rounded px-1.5 py-0.5 pointer-events-none">
        Maharashtra · schematic
      </span>
    </div>
  );
}

export function MapLegend() {
  const bands = ['Critical', 'High', 'Moderate', 'Watch', 'Stable'];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-500">
      {bands.map((b) => {
        const c = riskColor(b);
        return (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.hex, opacity: 0.85 }} />
            {b}
          </span>
        );
      })}
      <span className="text-ink-300">· bubble size = intensity</span>
    </div>
  );
}
