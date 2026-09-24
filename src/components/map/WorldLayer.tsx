import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, MultiLineString } from 'geojson';
import { BORDER_COLOR, COAST_COLOR, LAND_COLOR } from './mapSettings';
import { splitAtDateLine, unwrapFeatures } from './dateLine';

// Eigen wereldkaart zonder namen: landen en grenzen uit Natural Earth (vrij te
// gebruiken), meegeleverd met de site. Geen externe kaartdienst, geen sleutel.

interface WorldShapes {
  land: FeatureCollection;
  borders: MultiLineString;
  coasts: MultiLineString;
}

let cached: Promise<WorldShapes> | null = null;

function loadWorld(): Promise<WorldShapes> {
  cached ??= import('world-atlas/countries-50m.json').then((module) => {
    const topo = (module.default ?? module) as unknown as Topology;
    const countries = topo.objects.countries as GeometryCollection;
    return {
      land: unwrapFeatures(feature(topo, countries) as FeatureCollection),
      // Grens tussen twee landen (a !== b) of kustlijn (a === b).
      borders: splitAtDateLine(mesh(topo, countries, (a, b) => a !== b)),
      coasts: splitAtDateLine(mesh(topo, countries, (a, b) => a === b)),
    };
  });
  return cached;
}

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
