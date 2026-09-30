// Eigen ondergrond voor een onderwerp dat niet de wereldkaart gebruikt (zoals
// Nederland): het land, de buurlanden en de lijnen, plus hoe de kaart begint.

import type { FeatureCollection, Geometry, MultiLineString } from 'geojson';
import type { LatLngBoundsExpression } from 'leaflet';

export interface BaseMap {
  /** Het land zelf (bijv. de provincies), in de gewone landkleur. */
  land: FeatureCollection;
  /** Buurlanden en de rest van de wereld eromheen, iets grijzer. */
  neighbours: Geometry[];
  /** Binnengrenzen (bijv. tussen provincies). */
  innerBorders: MultiLineString;
  coast: MultiLineString;
  /** Landsgrens met de buurlanden. */
  border: MultiLineString;
}

/** Hoe de kaart begint en hoe ver je mag schuiven en zoomen. */
export interface MapView {
  /** Dit gebied past bij het begin (en na de terugknop) precies in beeld. */
  fit: LatLngBoundsExpression;
  minZoom: number;
  /** Verder schuiven dan dit kan niet. */
  maxBounds: LatLngBoundsExpression;
  /** Tekst op de knop terug naar het beginbeeld. */
  resetLabel: string;
}

/** Een onderwerp met een eigen kaart in plaats van de wereldkaart. */
export interface CategoryMap {
  view: MapView;
  loadBase: () => Promise<BaseMap>;
  /** Ligt dit punt op land (volgens deze kaart)? Voor klikken op water. */
  isOnLand: (lng: number, lat: number) => boolean;
  /** Bronvermelding rechtsonder op de kaart. */
  attribution: string;
}
