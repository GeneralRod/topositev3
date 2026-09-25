import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { BORDER_COLOR, COAST_COLOR, LAND_COLOR } from './mapSettings';
import { loadWorld, type WorldShapes } from './world';

// Eigen wereldkaart zonder namen (zie world.ts).

const WorldLayer: React.FC = () => {
  const [world, setWorld] = useState<WorldShapes | null>(null);

  useEffect(() => {
    let active = true;
    loadWorld()
      .then((shapes) => active && setWorld(shapes))
      .catch((error) => console.error('Wereldkaart kon niet laden:', error));
    return () => {
      active = false;
    };
  }, []);

  if (!world) return null;
  return (
    <>
      <GeoJSON
        data={world.land}
        interactive={false}
        style={{ fillColor: LAND_COLOR, fillOpacity: 1, stroke: false }}
        attribution="Kaart: Natural Earth"
      />
      <GeoJSON
        data={world.borders}
        interactive={false}
        style={{ color: BORDER_COLOR, weight: 1, fill: false }}
      />
      <GeoJSON
        data={world.coasts}
        interactive={false}
        style={{ color: COAST_COLOR, weight: 1.2, fill: false }}
      />
    </>
  );
};

export default WorldLayer;
