export interface Country {
  id: string;
  name: string;
  path: string;
}

// This is a simplified version of the world map data
// In a real implementation, you would want to use complete SVG paths for all countries
export const countries: Country[] = [
  {
    id: 'france',
    name: 'France',
    path: 'M 45 20 L 50 20 L 50 25 L 45 25 Z',
  },
  {
    id: 'germany',
    name: 'Germany',
    path: 'M 48 18 L 52 18 L 52 22 L 48 22 Z',
  },
  {
    id: 'spain',
    name: 'Spain',
    path: 'M 42 22 L 46 22 L 46 26 L 42 26 Z',
  },
  {
    id: 'italy',
    name: 'Italy',
    path: 'M 48 22 L 52 22 L 52 26 L 48 26 Z',
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    path: 'M 42 18 L 46 18 L 46 22 L 42 22 Z',
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    path: 'M 46 18 L 48 18 L 48 20 L 46 20 Z',
  },
  {
    id: 'belgium',
    name: 'Belgium',
    path: 'M 46 20 L 48 20 L 48 22 L 46 22 Z',
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    path: 'M 48 20 L 50 20 L 50 22 L 48 22 Z',
  },
  {
    id: 'austria',
    name: 'Austria',
    path: 'M 50 20 L 52 20 L 52 22 L 50 22 Z',
  },
  {
    id: 'sweden',
    name: 'Sweden',
    path: 'M 48 15 L 52 15 L 52 18 L 48 18 Z',
  },
  {
    id: 'norway',
    name: 'Norway',
    path: 'M 46 15 L 48 15 L 48 18 L 46 18 Z',
  },
  {
    id: 'denmark',
    name: 'Denmark',
    path: 'M 46 18 L 48 18 L 48 20 L 46 20 Z',
  },
  {
    id: 'poland',
    name: 'Poland',
    path: 'M 52 18 L 56 18 L 56 22 L 52 22 Z',
  },
  {
    id: 'czech-republic',
    name: 'Czech Republic',
    path: 'M 50 20 L 52 20 L 52 22 L 50 22 Z',
  },
  {
    id: 'slovakia',
    name: 'Slovakia',
    path: 'M 52 20 L 54 20 L 54 22 L 52 22 Z',
  },
  {
    id: 'hungary',
    name: 'Hungary',
    path: 'M 52 22 L 54 22 L 54 24 L 52 24 Z',
  },
  {
    id: 'romania',
    name: 'Romania',
    path: 'M 54 22 L 58 22 L 58 26 L 54 26 Z',
  },
  {
    id: 'bulgaria',
    name: 'Bulgaria',
    path: 'M 54 26 L 58 26 L 58 28 L 54 28 Z',
  },
  {
    id: 'greece',
    name: 'Greece',
    path: 'M 52 28 L 56 28 L 56 32 L 52 32 Z',
  },
  {
    id: 'portugal',
    name: 'Portugal',
    path: 'M 40 24 L 42 24 L 42 26 L 40 26 Z',
  },
];
