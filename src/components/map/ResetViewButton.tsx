import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { FaGlobeEurope } from 'react-icons/fa';
import { WORLD_CENTER, WORLD_ZOOM } from './mapSettings';

const Button = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  background: white;
  color: #1a73e8;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #e8f0fe;
  }
`;

/** Knop rechtsboven op de kaart: terug naar de hele wereld. */
const ResetViewButton: React.FC = () => {
  const map = useMap();
  const ref = useRef<HTMLButtonElement>(null);

  // Klikken en slepen op de knop mogen de kaart niet laten bewegen.
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);

  return (
    <Button ref={ref} type="button" onClick={() => map.setView(WORLD_CENTER, WORLD_ZOOM)}>
      <FaGlobeEurope /> Hele wereld
    </Button>
  );
};

export default ResetViewButton;
