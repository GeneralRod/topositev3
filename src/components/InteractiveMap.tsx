import React from 'react';
import styled from '@emotion/styled';
import { MapContainer as LeafletMap, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { City } from '../data/cities';
import ResetViewButton from './map/ResetViewButton';
import ShapeLayers from './map/ShapeLayers';
import type { ShapeData } from './map/shapes';
import WorldLayer from './map/WorldLayer';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  WATER_COLOR,
  WHEEL_PX_PER_ZOOM_LEVEL,
  WORLD_BOUNDS,
  WORLD_CENTER,
  WORLD_ZOOM,
} from './map/mapSettings';

import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  cities: City[];
  onBack: () => void;
  title: string;
  /** Vormen (zeeën, rivieren, ...) voor onderwerpen die dat hebben. */
  loadShapes?: () => Promise<ShapeData>;
  maxZoom?: number;
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

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cities,
  onBack,
  title,
  loadShapes,
  maxZoom = MAX_ZOOM,
}) => {
  const dotIcon = createDotIcon();
  const dots = cities.filter((c) => c.kind === undefined || c.kind === 'city');
  const others = cities.filter((c) => c.kind !== undefined && c.kind !== 'city');

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>Terug</BackButton>
        <Title>{title}</Title>
      </Header>
      <MapWrapper>
        <MapContainerWrapper>
          <LeafletMap
            style={{ background: WATER_COLOR }}
            preferCanvas
            center={WORLD_CENTER}
            zoom={WORLD_ZOOM}
            minZoom={MIN_ZOOM}
            maxZoom={maxZoom}
            maxBounds={WORLD_BOUNDS}
            maxBoundsViscosity={1}
            wheelPxPerZoomLevel={WHEEL_PX_PER_ZOOM_LEVEL}
          >
            <WorldLayer />
            <ResetViewButton />
            {loadShapes && others.length > 0 && <ShapeLayers places={others} load={loadShapes} />}
            {dots.map((city) => (
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
