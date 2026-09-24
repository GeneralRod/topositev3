// Gedeelde instellingen voor alle kaarten.

import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';

// Kleuren van de eigen wereldkaart (zie WorldLayer).
export const WATER_COLOR = '#a8d5f2';
export const LAND_COLOR = '#f4efdc';
export const BORDER_COLOR = '#b9a57e';
export const COAST_COLOR = '#6f9fc0';

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
