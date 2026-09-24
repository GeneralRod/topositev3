import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../../data/cities';
import ResetViewButton from '../map/ResetViewButton';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
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
}

const GameMap: React.FC<GameMapProps> = ({ cities, status, onCityClick }) => (
  <MapContainer
    center={WORLD_CENTER}
    zoom={WORLD_ZOOM}
    minZoom={MIN_ZOOM}
    maxZoom={MAX_ZOOM}
    maxBounds={WORLD_BOUNDS}
    maxBoundsViscosity={1}
    wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
    style={{ height: '100%', width: '100%' }}
    // Dubbelklikken zoomt niet: een snelle tweede klik zou als fout antwoord tellen.
    doubleClickZoom={false}
  >
    <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
    <ResetViewButton />
    {cities.map((city) => (
      <Marker
        key={city.name}
        position={[city.lat, city.lng]}
        icon={ICONS[status[city.name] ?? 'unanswered']}
        eventHandlers={{ click: () => onCityClick(city.name) }}
      />
    ))}
  </MapContainer>
);

export default GameMap;
