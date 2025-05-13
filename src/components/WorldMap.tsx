import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import styled from '@emotion/styled';

const MapWrapper = styled.div`
  height: 600px;
  width: 100%;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
`;

// Fix for default marker icons in Leaflet with React
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface WorldMapProps {
  onCountryClick?: (cityName: string) => void;
  cities: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountryClick, cities }) => {
  return (
    <MapWrapper>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cities.map((city) => (
          <Marker
            key={city.name}
            position={[city.latitude, city.longitude]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onCountryClick?.(city.name)
            }}
          >
            <Popup>
              <div>{city.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </MapWrapper>
  );
};

export default WorldMap; 