import React from 'react';
import styled from '@emotion/styled';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { City } from '../data/cities';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  cities: City[];
  onBack: () => void;
  selectedPackage: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #1a73e8;
  font-size: 1.5rem;
`;

const BackButton = styled.button`
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const createDotIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2VhNDMzNSIvPjwvc3ZnPg==',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const CityPopup = styled.div`
  text-align: center;
  padding: 0.5rem;
`;

const CityName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #202124;
  font-size: 1rem;
`;

const CountryName = styled.p`
  margin: 0;
  color: #5f6368;
  font-size: 0.875rem;
`;

const InteractiveMap: React.FC<InteractiveMapProps> = ({ cities, onBack, selectedPackage }) => {
  const dotIcon = createDotIcon();

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>Terug</BackButton>
        <Title>Interactieve Kaart {selectedPackage.replace('interactive', '')}</Title>
      </Header>
      <MapWrapper>
        <LeafletMap
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
              icon={dotIcon}
            >
              <Popup>
                <CityPopup>
                  <CityName>{city.name}</CityName>
                  <CountryName>{city.country}</CountryName>
                </CityPopup>
              </Popup>
            </Marker>
          ))}
        </LeafletMap>
      </MapWrapper>
    </Container>
  );
};

export default InteractiveMap; 