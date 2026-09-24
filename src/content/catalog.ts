// Alle onderwerpen en pakketten van de site. Een nieuw pakket of onderwerp
// toevoegen is alleen een kwestie van data hieronder aanvullen.

import { cities, type City } from '../data/cities';

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
}

export const categories: Category[] = [
  {
    id: 'capitals',
    title: 'Hoofd- en wereldsteden',
    description: 'Oefen met hoofdsteden en belangrijke steden wereldwijd',
    color: '#1a73e8',
    heading: 'Topografie Wereld: hoofd- en wereldsteden',
    locations: cities,
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
