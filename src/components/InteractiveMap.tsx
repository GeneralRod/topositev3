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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
    height: 80px;
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  height: calc(100vh - 80px);

  @media (max-width: 768px) {
    height: calc(100vh - 80px);
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #1a73e8;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    text-align: center;
  }
`;

const BackButton = styled.button`
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

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const MapContainerWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const createDotIcon = () => {
  return new Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNiIgZmlsbD0iI2VhNDMzNSIvPjwvc3ZnPg==',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const CityPopup = styled.div`
  text-align: center;
  padding: 0.5rem;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const CityName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #202124;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CountryName = styled.p`
  margin: 0;
  color: #5f6368;
  font-size: 0.875rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
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
        <MapContainerWrapper>
          <LeafletMap
            center={[20, 0]}
            zoom={2}
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
              <Marker key={city.name} position={[city.lat, city.lng]} icon={dotIcon}>
                <Popup>
                  <CityPopup>
                    <CityName>{city.name}</CityName>
                    <CountryName>{city.country}</CountryName>
                  </CityPopup>
                </Popup>
              </Marker>
            ))}
          </LeafletMap>
        </MapContainerWrapper>
      </MapWrapper>
    </Container>
  );
};

export default InteractiveMap;
