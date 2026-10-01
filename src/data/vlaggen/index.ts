// Categorie "Vlaggen van de wereld". De lijst komt uit scripts/vlaggen/build.mjs;
// pas die aan en draai het script opnieuw, niet deze bestanden met de hand.
//
// De vlaggen zelf staan in public/vlaggen (flag-icons, MIT-licentie) en worden pas
// geladen als ze in beeld komen. De vormen van de landen (voor aanwijzen) komen uit
// dezelfde wereldkaart als bij "Landen van de wereld".

import type { City, PlaceKind } from '../cities';
import { countryShapes, type CountryRecord } from '../landen';
import type { ShapeData } from '../../components/map/shapes';
import placeData from './places.json';

interface FlagRecord {
  name: string;
  package: string;
  kind: string;
  hint: string;
  code: string;
  lat: number;
  lng: number;
  tint?: number;
  atlas?: string[];
}

const records = placeData as FlagRecord[];

export const flagPlaces: City[] = records.map((p) => ({
  name: p.name,
  country: '',
  coordinates: [p.lat, p.lng],
  package: p.package,
  lat: p.lat,
  lng: p.lng,
  continent: p.hint,
  kind: p.kind as PlaceKind,
}));

const codes = new Map(records.map((r) => [r.name, r.code]));

/** De vlag van een land (een plaatje in public/vlaggen), of undefined als het geen land is. */
export function flagOf(name: string): string | undefined {
  const code = codes.get(name);
  return code ? `${import.meta.env.BASE_URL}vlaggen/${code}.svg` : undefined;
}

let cached: Promise<ShapeData> | null = null;

/** De landen die groot genoeg zijn om aan te klikken, uit de wereldkaart. */
export function loadFlagShapes(): Promise<ShapeData> {
  cached ??= import('../../components/map/world')
    .then(async (world) => {
      const { land } = await world.loadWorld();
      const shapes = records.filter((r) => r.kind === 'country') as CountryRecord[];
      return countryShapes(land, null, shapes);
    })
    .catch((error) => {
      // Volgende keer opnieuw proberen in plaats van de fout te onthouden.
      cached = null;
      throw error;
    });
  return cached;
}
