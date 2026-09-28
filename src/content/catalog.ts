// Alle onderwerpen en pakketten van de site. Een nieuw pakket of onderwerp
// toevoegen is alleen een kwestie van data hieronder aanvullen.

import { cities, type City } from '../data/cities';
import { loadWaterShapes, waterPlaces } from '../data/wateren';
import { loadNederlandShapes, nederlandMap, nederlandPlaces } from '../data/nederland';
import type { ShapeData } from '../components/map/shapes';
import type { CategoryMap } from '../components/map/baseMap';

export interface GamePackage {
  /** Deel van de url en sleutel voor opgeslagen voortgang; niet meer wijzigen. */
  id: string;
  title: string;
  description: string;
  color: string;
  /** Welke stedengroepen (het `package`-veld in de data) meedoen. */
  groups: string[];
}

export interface PackageSection {
  title: string;
  kind: 'game' | 'map';
  packages: GamePackage[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  color: string;
  heading: string;
  locations: City[];
  sections: PackageSection[];
  /** Hoe je één en meer plekken noemt in teksten ("stad" / "steden"). */
  words: { one: string; many: string };
  /** Laadt de vormen (zeeën, rivieren, ...) als dit onderwerp die heeft. */
  loadShapes?: () => Promise<ShapeData>;
  /** Hoe ver je mag inzoomen (standaard: zie mapSettings). */
  maxZoom?: number;
  /** Eigen kaart (bijv. Nederland) in plaats van de wereldkaart. */
  map?: CategoryMap;
}

export const categories: Category[] = [
  {
    id: 'capitals',
    title: 'Hoofd- en wereldsteden',
    description: 'Oefen met hoofdsteden en belangrijke steden wereldwijd',
    color: '#1a73e8',
    heading: 'Topografie Wereld: hoofd- en wereldsteden',
    locations: cities,
    words: { one: 'stad', many: 'steden' },
    sections: [
      {
        title: 'Oefenpakketten',
        kind: 'game',
        packages: [
          {
            id: 'pakket1',
            title: 'Pakket 1',
            description: 'Basis steden over de hele wereld',
            color: '#1a73e8',
            groups: ['pakket1'],
          },
          {
            id: 'pakket2',
            title: 'Pakket 2',
            description: 'Extra steden over de wereld',
            color: '#34a853',
            groups: ['pakket2'],
          },
          {
            id: 'pakket3',
            title: 'Pakket 3',
            description: 'Extra steden over de wereld',
            color: '#fbbc05',
            groups: ['pakket3'],
          },
        ],
      },
      {
        title: 'Gecombineerde Pakketten',
        kind: 'game',
        packages: [
          {
            id: 'pakket1-2',
            title: 'Pakket 1 + 2',
            description: 'Alle steden uit pakket 1 en 2',
            color: '#ea4335',
            groups: ['pakket1', 'pakket2'],
          },
          {
            id: 'pakket2-3',
            title: 'Pakket 2 + 3',
            description: 'Alle steden uit pakket 2 en 3',
            color: '#9334e6',
            groups: ['pakket2', 'pakket3'],
          },
          {
            id: 'pakket1-2-3',
            title: 'Pakket 1 + 2 + 3',
            description: 'Alle steden uit alle pakketten',
            color: '#4285f4',
            groups: ['pakket1', 'pakket2', 'pakket3'],
          },
        ],
      },
      {
        title: 'Interactieve Kaarten',
        kind: 'map',
        packages: [
          {
            id: 'interactive1',
            title: 'Interactieve kaart pakket 1',
            description: 'Bekijk alle steden uit pakket 1',
            color: '#1a73e8',
            groups: ['pakket1'],
          },
          {
            id: 'interactive2',
            title: 'Interactieve kaart pakket 2',
            description: 'Bekijk alle steden uit pakket 2',
            color: '#34a853',
            groups: ['pakket2'],
          },
          {
            id: 'interactive3',
            title: 'Interactieve kaart pakket 3',
            description: 'Bekijk alle steden uit pakket 3',
            color: '#fbbc05',
            groups: ['pakket3'],
          },
        ],
      },
    ],
  },
  {
    id: 'wateren',
    title: 'Wateren en landschappen over de wereld',
    description: 'Oceanen, zeeën, rivieren, meren, woestijnen, gebergtes en bergen',
    color: '#0f8b8d',
    heading: 'Topografie Wereld: wateren en landschappen',
    locations: waterPlaces,
    words: { one: 'plek', many: 'plekken' },
    loadShapes: loadWaterShapes,
    // De vormen zijn gemaakt voor wereld- en werelddeelniveau; dieper inzoomen
    // laat alleen zien hoe grof de kustlijn van de wereldkaart is.
    maxZoom: 7,
    sections: [
      {
        title: 'Oefenpakketten',
        kind: 'game',
        packages: [
          {
            // Id's zijn uniek over alle onderwerpen: sterren en spellen worden per id bewaard.
            id: 'wateren1',
            title: 'Pakket 1',
            description: 'Oceanen, zeeën, rivieren, meren, woestijnen, gebergtes en bergen',
            color: '#0f8b8d',
            groups: ['wateren1'],
          },
          {
            id: 'wateren2',
            title: 'Pakket 2',
            description: 'Oostzee, Tasmanzee, Lena, Zambezi, Tigris, Atlas, Oeral en drie bergen',
            color: '#2e7d32',
            groups: ['wateren2'],
          },
          {
            id: 'wateren3',
            title: 'Pakket 3',
            description:
              'Golf van Bengalen, Caribische Zee, Ob, Huang He, twee Grote Meren, Pyreneeën, Karpaten en twee bergen',
            color: '#c77c02',
            groups: ['wateren3'],
          },
          {
            id: 'wateren4',
            title: 'Pakket 4',
            description:
              'Huron-, Erie- en Ontariomeer, Indus, Yukon, Kongo, Marianentrog, Gobi en twee bergen',
            color: '#00838f',
            groups: ['wateren4'],
          },
        ],
      },
      {
        title: 'Gecombineerde Pakketten',
        kind: 'game',
        packages: [
          {
            id: 'wateren1-2',
            title: 'Pakket 1 + 2',
            description: 'Alles uit pakket 1 en 2',
            color: '#6d4c41',
            groups: ['wateren1', 'wateren2'],
          },
          {
            id: 'wateren2-3',
            title: 'Pakket 2 + 3',
            description: 'Alles uit pakket 2 en 3',
            color: '#8e24aa',
            groups: ['wateren2', 'wateren3'],
          },
          {
            id: 'wateren1-2-3',
            title: 'Pakket 1 + 2 + 3',
            description: 'Alles uit pakket 1, 2 en 3',
            color: '#1565c0',
            groups: ['wateren1', 'wateren2', 'wateren3'],
          },
          {
            id: 'wateren3-4',
            title: 'Pakket 3 + 4',
            description: 'Alles uit pakket 3 en 4',
            color: '#ad1457',
            groups: ['wateren3', 'wateren4'],
          },
          {
            id: 'wateren1-2-3-4',
            title: 'Alle pakketten',
            description: 'Alle 70 wateren en landschappen uit pakket 1 t/m 4',
            color: '#37474f',
            groups: ['wateren1', 'wateren2', 'wateren3', 'wateren4'],
          },
        ],
      },
      {
        title: 'Interactieve Kaarten',
        kind: 'map',
        packages: [
          {
            id: 'wateren-kaart1',
            title: 'Interactieve kaart pakket 1',
            description: 'Bekijk alle wateren en landschappen uit pakket 1',
            color: '#0f8b8d',
            groups: ['wateren1'],
          },
          {
            id: 'wateren-kaart2',
            title: 'Interactieve kaart pakket 2',
            description: 'Bekijk alle wateren en landschappen uit pakket 2',
            color: '#2e7d32',
            groups: ['wateren2'],
          },
          {
            id: 'wateren-kaart3',
            title: 'Interactieve kaart pakket 3',
            description: 'Bekijk alle wateren en landschappen uit pakket 3',
            color: '#c77c02',
            groups: ['wateren3'],
          },
          {
            id: 'wateren-kaart4',
            title: 'Interactieve kaart pakket 4',
            description: 'Bekijk alle wateren en landschappen uit pakket 4',
            color: '#00838f',
            groups: ['wateren4'],
          },
        ],
      },
    ],
  },
  {
    id: 'nederland',
    title: 'Nederland',
    description: 'Provincies, steden, wateren, rivieren, eilanden en gebieden',
    color: '#e8710a',
    heading: 'Topografie Nederland',
    locations: nederlandPlaces,
    words: { one: 'plek', many: 'plekken' },
    loadShapes: loadNederlandShapes,
    // Diep genoeg om elk eiland en elke stad precies te zien.
    maxZoom: 11,
    map: nederlandMap,
    sections: [
      {
        title: 'Oefenpakketten',
        kind: 'game',
        packages: [
          {
            id: 'nederland1',
            title: 'Pakket 1',
            description: 'De 12 provincies',
            color: '#e8710a',
            groups: ['nederland1'],
          },
          {
            id: 'nederland2',
            title: 'Pakket 2',
            description: 'Hoofdstad en de provinciehoofdsteden',
            color: '#1a73e8',
            groups: ['nederland2'],
          },
          {
            id: 'nederland3',
            title: 'Pakket 3',
            description: 'Grote steden',
            color: '#34a853',
            groups: ['nederland3'],
          },
          {
            id: 'nederland4',
            title: 'Pakket 4',
            description: 'Zeeën, meren en zeearmen',
            color: '#0f8b8d',
            groups: ['nederland4'],
          },
          {
            id: 'nederland5',
            title: 'Pakket 5',
            description: 'Rivieren en kanalen',
            color: '#1565c0',
            groups: ['nederland5'],
          },
          {
            id: 'nederland6',
            title: 'Pakket 6',
            description: 'Eilanden, gebieden, de Afsluitdijk en de Vaalserberg',
            color: '#8d6e63',
            groups: ['nederland6'],
          },
        ],
      },
      {
        title: 'Gecombineerde Pakketten',
        kind: 'game',
        packages: [
          {
            id: 'nederland1-2',
            title: 'Pakket 1 + 2',
            description: 'Provincies en hun hoofdsteden',
            color: '#c2185b',
            groups: ['nederland1', 'nederland2'],
          },
          {
            id: 'nederland2-3',
            title: 'Pakket 2 + 3',
            description: 'Alle steden',
            color: '#6a1b9a',
            groups: ['nederland2', 'nederland3'],
          },
          {
            id: 'nederland1-2-3',
            title: 'Pakket 1 + 2 + 3',
            description: 'Provincies en alle steden',
            color: '#283593',
            groups: ['nederland1', 'nederland2', 'nederland3'],
          },
          {
            id: 'nederland4-5',
            title: 'Pakket 4 + 5',
            description: 'Al het water: zeeën, meren, rivieren en kanalen',
            color: '#00695c',
            groups: ['nederland4', 'nederland5'],
          },
          {
            id: 'nederland4-5-6',
            title: 'Pakket 4 + 5 + 6',
            description: 'Water, eilanden en gebieden',
            color: '#5d4037',
            groups: ['nederland4', 'nederland5', 'nederland6'],
          },
          {
            id: 'nederland-alles',
            title: 'Alle pakketten',
            description: 'Alle 79 plekken van Nederland uit pakket 1 t/m 6',
            color: '#37474f',
            groups: [
              'nederland1',
              'nederland2',
              'nederland3',
              'nederland4',
              'nederland5',
              'nederland6',
            ],
          },
        ],
      },
      {
        title: 'Interactieve Kaarten',
        kind: 'map',
        packages: [
          {
            id: 'nederland-kaart1',
            title: 'Interactieve kaart pakket 1',
            description: 'Bekijk de 12 provincies',
            color: '#e8710a',
            groups: ['nederland1'],
          },
          {
            id: 'nederland-kaart2',
            title: 'Interactieve kaart pakket 2',
            description: 'Bekijk hoofdstad en de provinciehoofdsteden',
            color: '#1a73e8',
            groups: ['nederland2'],
          },
          {
            id: 'nederland-kaart3',
            title: 'Interactieve kaart pakket 3',
            description: 'Bekijk grote steden',
            color: '#34a853',
            groups: ['nederland3'],
          },
          {
            id: 'nederland-kaart4',
            title: 'Interactieve kaart pakket 4',
            description: 'Bekijk zeeën, meren en zeearmen',
            color: '#0f8b8d',
            groups: ['nederland4'],
          },
          {
            id: 'nederland-kaart5',
            title: 'Interactieve kaart pakket 5',
            description: 'Bekijk rivieren en kanalen',
            color: '#1565c0',
            groups: ['nederland5'],
          },
          {
            id: 'nederland-kaart6',
            title: 'Interactieve kaart pakket 6',
            description: 'Bekijk eilanden, gebieden, de Afsluitdijk en de Vaalserberg',
            color: '#8d6e63',
            groups: ['nederland6'],
          },
        ],
      },
    ],
  },
];

export function findCategory(categoryId: string | undefined): Category | undefined {
  return categories.find((c) => c.id === categoryId);
}

export function findPackage(
  category: Category | undefined,
  packageId: string | undefined,
): { pkg: GamePackage; kind: PackageSection['kind'] } | undefined {
  for (const section of category?.sections ?? []) {
    const pkg = section.packages.find((p) => p.id === packageId);
    if (pkg) return { pkg, kind: section.kind };
  }
  return undefined;
}

export function locationsFor(category: Category, pkg: GamePackage): City[] {
  return category.locations.filter((location) => pkg.groups.includes(location.package));
}

/** Pakket-id van het oefenrondje met je lastige steden (in de url). */
export const PRACTICE_PACKAGE_ID = 'lastig';

/** Pakket-id van de dagelijkse uitdaging (in de url). */
export const DAILY_PACKAGE_ID = 'vandaag';
