import React, { useEffect, useMemo, useState } from 'react';
import { GeoJSON, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { City } from '../../data/cities';
import type { CityStatus } from '../../game/rules';
import { PULSE_ICON, peakIcon } from './icons';
import {
  containsPoint,
  highlightStyle,
  SHAPE_COLORS,
  shapeStyle,
  type ShapeData,
  type ShapeFeature,
} from './shapes';
import { isOnLand } from './world';
import { splitAtDateLine } from './dateLine';

// Vormen op de kaart, in lagen:
//   zeeën (onder het land, zodat het land de precieze kust tekent)
//   land (WorldLayer, overlayPane)
//   gebergtes, woestijnen, meren en rivieren (boven het land)
//   bergtoppen (driehoekjes)
// Zeeën liggen onder het land en krijgen dus geen klikken: een klik op de kaart
// die niets anders raakt, wordt hier zelf getest ('in welke zee ligt dit?').

const SEA_PANE = 'zeeen';
const SHAPE_PANE = 'vormen';

const PEAK_ICONS: Record<CityStatus, L.DivIcon> = {
  unanswered: peakIcon('#7d5c3f'),
  blue: peakIcon(SHAPE_COLORS.retry),
  green: peakIcon(SHAPE_COLORS.found),
};

/**
 * Leaflet geeft 'renderer' van een GeoJSON-laag door aan de vormen erin, maar de
 * types van react-leaflet kennen die optie niet; via een spread mag het wel.
 */
function withRenderer(renderer: L.Renderer): object {
  return { renderer };
}

/**
 * De kaart loopt iets voorbij de datumgrens (±180°). Zeeën die daar tegenaan
 * liggen (Grote Oceaan, Beringzee, Noordelijke IJszee) tekenen we aan de andere
 * kant nog een keer, anders houdt de zee daar zichtbaar op.
 */
function dateLineCopies(features: ShapeFeature[]): ShapeFeature[] {
  const copies: ShapeFeature[] = [];
  for (const f of features) {
    let min = Infinity;
    let max = -Infinity;
    mapPoints(f, ([lng, lat]) => {
      min = Math.min(min, lng);
      max = Math.max(max, lng);
      return [lng, lat];
    });
    if (min <= -179.9) copies.push(mapPoints(f, ([lng, lat]) => [lng + 360, lat]));
    if (max >= 179.9) copies.push(mapPoints(f, ([lng, lat]) => [lng - 360, lat]));
  }
  return copies;
}

/** Kopie van een vorm met elk punt [lengte, breedte] aangepast. */
function mapPoints(
  feature: ShapeFeature,
  change: (point: [number, number]) => [number, number],
): ShapeFeature {
  const walk = (c: unknown): unknown =>
    Array.isArray(c) && typeof c[0] === 'number'
      ? change(c as [number, number])
      : (c as unknown[]).map(walk);
  const geometry = feature.geometry as { type: string; coordinates: unknown };
  return {
    ...feature,
    geometry: { ...geometry, coordinates: walk(geometry.coordinates) } as ShapeFeature['geometry'],
  };
}

/** Lengtegraad terug naar -180..180 (een klik voorbij de datumgrens). */
function wrapLng(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

/** Tekenvolgorde boven het land: grote vlakken eerst, rivieren bovenop. */
const DRAW_ORDER = ['range', 'desert', 'lake', 'river'];

function usePanes(): void {
  const map = useMap();
  // Direct bij het tekenen (niet in een effect): de lagen hieronder hebben de
  // panes al nodig op het moment dat ze zichzelf toevoegen.
  if (!map.getPane(SEA_PANE)) {
    const seas = map.createPane(SEA_PANE);
    seas.style.zIndex = '350';
    seas.style.pointerEvents = 'none';
    map.createPane(SHAPE_PANE).style.zIndex = '450';
  }
}

interface ShapeLayersProps {
  /** Plekken met een vorm of een bergtop (geen steden). */
  places: City[];
  load: () => Promise<ShapeData>;
  /** Spel: stand per plek. Zonder status: verkenkaart met namen. */
  status?: Record<string, CityStatus>;
  onPick?: (name: string) => void;
  /** Meerkeuze: toon alleen deze plek, knipperend. */
  highlight?: string | null;
}

const ShapeLayers: React.FC<ShapeLayersProps> = ({ places, load, status, onPick, highlight }) => {
  usePanes();
  const [data, setData] = useState<ShapeData | null>(null);
  const [popup, setPopup] = useState<{ name: string; latlng: L.LatLng } | null>(null);
  const explore = status === undefined;
  const choosing = highlight !== undefined;

  // Rivieren zijn smal: een klik tot een paar pixels ernaast telt ook.
  const canvas = useMemo(() => L.canvas({ pane: SHAPE_PANE, tolerance: 6 }), []);
  // Knipperen kan alleen met SVG (met een CSS-animatie).
  const blinkAbove = useMemo(() => L.svg({ pane: SHAPE_PANE }), []);
  const blinkBelow = useMemo(() => L.svg({ pane: SEA_PANE }), []);

  useEffect(() => {
    let active = true;
    load()
      .then((shapes) => active && setData(shapes))
      .catch((error) => console.error('Vormen konden niet laden:', error));
    return () => {
      active = false;
    };
  }, [load]);

  const byName = useMemo(() => {
    const map = new Map<string, ShapeFeature>();
    for (const f of data?.features ?? []) map.set(f.properties.name, f as ShapeFeature);
    return map;
  }, [data]);

  const names = places.map((p) => p.name).join('|');
  const seas = useMemo(() => {
    const inGame = new Set(names.split('|'));
    return [...byName.values()].filter(
      (f) => f.properties.kind === 'sea' && inGame.has(f.properties.name),
    );
  }, [byName, names]);
  const seaCopies = useMemo(() => dateLineCopies(seas), [seas]);
  // Alleen grenzen van zeeën die meedoen, en zonder de kunstmatige knip langs de
  // datumgrens (dat is geen echte zeegrens).
  const seaBorders = useMemo(() => {
    const inGame = new Set(seas.map((f) => f.properties.name));
    const lines = (data?.seaBorders ?? [])
      .filter((border) => border.between.some((name) => inGame.has(name)))
      .flatMap((border) => border.coordinates);
    return splitAtDateLine({ type: 'MultiLineString', coordinates: lines });
  }, [data, seas]);

  const pick = (name: string, latlng: L.LatLng) => {
    if (explore) setPopup({ name, latlng });
    else onPick?.(name);
  };

  useMapEvents({
    click(event) {
      if (choosing) return;
      const { lng, lat } = event.latlng;
      if (isOnLand(lng, lat)) return;
      const sea = seas.find((f) => containsPoint(f.geometry, wrapLng(lng), lat));
      if (sea) pick(sea.properties.name, event.latlng);
      else setPopup(null);
    },
  });

  if (!data) return null;

  if (choosing) {
    const place = places.find((p) => p.name === highlight);
    if (!place) return null;
    const shape = byName.get(place.name);
    return (
      <>
        {shape && (
          <GeoJSON
            key={`blink-${place.name}`}
            data={shape}
            interactive={false}
            {...withRenderer(place.kind === 'sea' ? blinkBelow : blinkAbove)}
            style={{ ...highlightStyle(place.kind ?? 'city'), className: 'pulse-shape' }}
          />
        )}
        <Marker position={[place.lat, place.lng]} icon={PULSE_ICON} interactive={false} />
      </>
    );
  }

  const statusOf = (name: string): CityStatus => status?.[name] ?? 'unanswered';
  const onLand = places
    .filter((p) => p.kind !== 'sea' && p.kind !== 'peak' && byName.has(p.name))
    .sort((a, b) => DRAW_ORDER.indexOf(a.kind ?? '') - DRAW_ORDER.indexOf(b.kind ?? ''));

  return (
    <>
      {[...seas, ...seaCopies].map((f, i) => (
        <GeoJSON
          key={`${f.properties.name}-${i}`}
          data={f}
          pane={SEA_PANE}
          interactive={false}
          style={shapeStyle('sea', statusOf(f.properties.name))}
        />
      ))}
      {seas.length > 0 && seaBorders && (
        <GeoJSON
          data={seaBorders}
          pane={SEA_PANE}
          interactive={false}
          style={{ color: SHAPE_COLORS.seaBorder, weight: 1, dashArray: '4 4', opacity: 0.7 }}
        />
      )}
      {onLand.map((place) => (
        <GeoJSON
          key={place.name}
          data={byName.get(place.name)!}
          {...withRenderer(canvas)}
          bubblingMouseEvents={false}
          style={shapeStyle(place.kind!, statusOf(place.name))}
          eventHandlers={{ click: (event) => pick(place.name, event.latlng) }}
        >
          {explore && <Tooltip sticky>{place.name}</Tooltip>}
        </GeoJSON>
      ))}
      {places
        .filter((p) => p.kind === 'peak')
        .map((place) => (
          <Marker
            key={place.name}
            position={[place.lat, place.lng]}
            icon={PEAK_ICONS[statusOf(place.name)]}
            eventHandlers={{ click: (event) => pick(place.name, event.latlng) }}
          >
            {explore && <Tooltip>{place.name}</Tooltip>}
          </Marker>
        ))}
      {explore && popup && (
        <Popup position={popup.latlng} eventHandlers={{ remove: () => setPopup(null) }}>
          <strong>{popup.name}</strong>
        </Popup>
      )}
    </>
  );
};

export default ShapeLayers;
