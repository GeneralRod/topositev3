// Gedeelde instellingen voor alle kaarten.

import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';

// Kaart zonder namen (CARTO Voyager 'nolabels'), zodat inzoomen het antwoord
// niet verraadt. Gratis voor niet-commercieel gebruik, met bronvermelding.
export const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Beginbeeld: de hele wereld. */
export const WORLD_CENTER: LatLngTuple = [20, 0];
export const WORLD_ZOOM = 2;
export const MIN_ZOOM = 2;
/** Diep genoeg om precies te zien waar een stad ligt. */
export const MAX_ZOOM = 10;
/** Niet verder slepen dan de wereld zelf. */
export const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-85, -200],
  [85, 200],
];
/** Rustiger zoomen met het muiswiel (standaard is 60: erg snel). */
export const WHEEL_PX_PER_ZOOM_LEVEL = 120;
