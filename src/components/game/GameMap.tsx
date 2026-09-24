import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { City } from '../../data/cities';
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
    center={[20, 0]}
    zoom={2}
    style={{ height: '100%', width: '100%' }}
    zoomControl={false}
    doubleClickZoom={false}
    scrollWheelZoom={false}
    dragging={false}
    touchZoom={false}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
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
