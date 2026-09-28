import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { BaseMap } from './baseMap';
import { COAST_COLOR, LAND_COLOR, NATIONAL_BORDER_COLOR, NEIGHBOUR_COLOR } from './mapSettings';

// Eigen ondergrond (zie baseMap.ts), bijv. Nederland met zijn provincies.

interface BaseLayerProps {
  load: () => Promise<BaseMap>;
  attribution: string;
}

const BaseLayer: React.FC<BaseLayerProps> = ({ load, attribution }) => {
  const [base, setBase] = useState<BaseMap | null>(null);

  useEffect(() => {
    let active = true;
    load()
      .then((shapes) => active && setBase(shapes))
      .catch((error) => console.error('Kaart kon niet laden:', error));
    return () => {
      active = false;
    };
  }, [load]);

  if (!base) return null;
  return (
    <>
      {base.neighbours.map((geometry, i) => (
        <GeoJSON
          key={i}
          data={geometry}
          interactive={false}
          // Zonder rand: de randen van deze vlakken zijn deels knippen, geen kust.
          style={{ fillColor: NEIGHBOUR_COLOR, fillOpacity: 1, stroke: false }}
        />
      ))}
      <GeoJSON
        data={base.land}
        interactive={false}
        style={{ fillColor: LAND_COLOR, fillOpacity: 1, stroke: false }}
        attribution={attribution}
      />
      <GeoJSON
        data={base.innerBorders}
        interactive={false}
        style={{ color: NATIONAL_BORDER_COLOR, weight: 1, opacity: 0.55, fill: false }}
      />
      <GeoJSON
        data={base.coast}
        interactive={false}
        style={{ color: COAST_COLOR, weight: 1.2, fill: false }}
      />
      <GeoJSON
        data={base.border}
        interactive={false}
        style={{ color: NATIONAL_BORDER_COLOR, weight: 2, fill: false }}
      />
    </>
  );
};

export default BaseLayer;
