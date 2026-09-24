import L from 'leaflet';

// Knipperende stip voor meerkeuze (animatie in index.css).
export const PULSE_ICON = L.divIcon({
  className: 'pulse-dot',
  html: '<div class="pulse-dot__ring"></div><div class="pulse-dot__core"></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

/** Driehoekje voor een bergtop. */
export function peakIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'peak-icon',
    html: `<svg width="20" height="18" viewBox="0 0 20 18" aria-hidden="true">
      <path d="M10 2 L18.5 16 H1.5 Z" fill="${color}" stroke="white" stroke-width="2"
        stroke-linejoin="round" />
    </svg>`,
    iconSize: [20, 18],
    iconAnchor: [10, 12],
  });
}
