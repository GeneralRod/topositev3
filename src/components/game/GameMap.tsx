import React from 'react';
import { MapContainer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../../data/cities';
import ShapeLayers from '../map/ShapeLayers';
import type { ShapeData } from '../map/shapes';
import { PULSE_ICON } from '../map/icons';
import ResetViewButton from '../map/ResetViewButton';
import WorldLayer from '../map/WorldLayer';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  WATER_COLOR,
  WHEEL_PX_PER_ZOOM_LEVEL,
  WORLD_BOUNDS,
  WORLD_CENTER,
  WORLD_ZOOM,
} from '../map/mapSettings';
import type { CityStatus } from '../../game/rules';

const STATUS_COLORS: Record<CityStatus, string> = {
  unanswered: '#ea4335',
  blue: '#4285f4',
  green: '#34a853',
};

function dotIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-dot',
    html: `<div style="
      width: 12px;
      height: 12px;
      background-color: ${color};
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

// Eén icoon per status, één keer gemaakt (niet bij elke klik opnieuw voor elke stip).
const ICONS = Object.fromEntries(
  Object.entries(STATUS_COLORS).map(([status, color]) => [status, dotIcon(color)]),
) as Record<CityStatus, L.DivIcon>;

interface GameMapProps {
  cities: City[];
  status: Record<string, CityStatus>;
  onCityClick: (cityName: string) => void;
  /** Meerkeuze: toon alleen deze plek, knipperend en niet klikbaar. */
  highlight?: string | null;
  /** Vormen (zeeën, rivieren, ...) voor onderwerpen die dat hebben. */
  loadShapes?: () => Promise<ShapeData>;
  maxZoom?: number;
}

const GameMap: React.FC<GameMapProps> = ({
  cities,
  status,
  onCityClick,
  highlight,
  loadShapes,
  maxZoom = MAX_ZOOM,
}) => {
  const dots = cities.filter((c) => c.kind === undefined || c.kind === 'city');
  const others = cities.filter((c) => c.kind !== undefined && c.kind !== 'city');
  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={WORLD_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={maxZoom}
      maxBounds={WORLD_BOUNDS}
      maxBoundsViscosity={1}
      wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
      style={{ height: '100%', width: '100%', background: WATER_COLOR }}
      // Landen tekenen op canvas: veel sneller dan losse SVG-vormen.
      preferCanvas
      // Dubbelklikken zoomt niet: een snelle tweede klik zou als fout antwoord tellen.
      doubleClickZoom={false}
    >
      <WorldLayer />
      <ResetViewButton />
      {loadShapes && others.length > 0 && (
        <ShapeLayers
          places={others}
          load={loadShapes}
          status={status}
          onPick={onCityClick}
          highlight={highlight}
        />
      )}
      {highlight !== undefined
        ? dots
            .filter((city) => city.name === highlight)
            .map((city) => (
              <Marker key={city.name} position={[city.lat, city.lng]} icon={PULSE_ICON} />
            ))
        : dots.map((city) => (
            <Marker
              key={city.name}
              position={[city.lat, city.lng]}
              icon={ICONS[status[city.name] ?? 'unanswered']}
              eventHandlers={{ click: () => onCityClick(city.name) }}
            />
          ))}
    </MapContainer>
  );
};

export default GameMap;
