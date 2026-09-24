import type { FeatureCollection, MultiLineString } from 'geojson';

/**
 * Lijnen die over de datumgrens (±180°) springen, worden door de kaart als
 * rechte streep dwars over de wereld getekend. Knip ze daar door, en laat de
 * kunstmatige snijlijnen langs ±180° weg.
 */
export function splitAtDateLine(lines: MultiLineString): MultiLineString {
  const onEdge = (lng: number) => Math.abs(lng) >= 179.99;
  const parts: number[][][] = [];
  for (const line of lines.coordinates) {
    let current: number[][] = [];
    for (let i = 0; i < line.length; i++) {
      const point = line[i];
      const previous = line[i - 1];
      const jump = previous && Math.abs(point[0] - previous[0]) > 180;
      const alongEdge = previous && onEdge(point[0]) && onEdge(previous[0]);
      if (jump || alongEdge) {
        if (current.length > 1) parts.push(current);
        current = [];
      }
      current.push(point);
    }
    if (current.length > 1) parts.push(current);
  }
  return { type: 'MultiLineString', coordinates: parts };
}

type Ring = number[][];

/**
 * Een ring (omtrek van een land) die over ±180° springt, wordt 'uitgevouwen':
 * de punten na de sprong schuiven 360° op, zodat het land in één stuk over de
 * rand heen loopt in plaats van als band over de hele wereld. Ringen die echt
 * rond de aarde lopen (Antarctica) blijven zoals ze zijn.
 */
export function unwrapRing(ring: Ring): Ring {
  const out: Ring = [];
  let offset = 0;
  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    if (i > 0) {
      const delta = lng - ring[i - 1][0];
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    out.push([lng + offset, lat]);
  }
  return offset === 0 ? out : ring;
}

export function unwrapFeatures(collection: FeatureCollection): FeatureCollection {
  return {
    ...collection,
    features: collection.features.map((f) => {
      const g = f.geometry;
      if (g.type === 'Polygon') {
        return { ...f, geometry: { ...g, coordinates: g.coordinates.map(unwrapRing) } };
      }
      if (g.type === 'MultiPolygon') {
        return {
          ...f,
          geometry: { ...g, coordinates: g.coordinates.map((poly) => poly.map(unwrapRing)) },
        };
      }
      return f;
    }),
  };
}
