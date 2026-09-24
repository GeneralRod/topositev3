// Categorie "Wateren en landschappen over de wereld". De gegevens komen uit
// scripts/wateren/build.mjs (Natural Earth); pas die aan en draai het script
// opnieuw, niet deze bestanden met de hand.

import type { City, PlaceKind } from '../cities';
import placeData from './places.json';
// Alleen de url: het grote vormenbestand wordt pas opgehaald als je gaat spelen.
import shapesUrl from './shapes.json?url';
import type { ShapeData } from '../../components/map/shapes';

interface PlaceRecord {
  name: string;
  package: string;
  kind: string;
  hint: string;
  lat: number;
  lng: number;
}

export const waterPlaces: City[] = (placeData as PlaceRecord[]).map((p) => ({
  name: p.name,
  country: '',
  coordinates: [p.lat, p.lng],
  package: p.package,
  lat: p.lat,
  lng: p.lng,
  continent: p.hint,
  kind: p.kind as PlaceKind,
}));

let cached: Promise<ShapeData> | null = null;

export function loadWaterShapes(): Promise<ShapeData> {
  cached ??= fetch(shapesUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Vormen laden mislukt (${response.status})`);
      return response.json() as Promise<ShapeData>;
    })
    .catch((error) => {
      // Volgende keer opnieuw proberen in plaats van de fout te onthouden.
      cached = null;
      throw error;
    });
  return cached;
}
