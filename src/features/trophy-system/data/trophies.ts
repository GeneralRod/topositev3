import { Achievement, PurchasableTrophy } from '../types';

export const achievements: Achievement[] = [
  {
    id: 'perfect-europe',
    name: 'European Master',
    description: 'Get a perfect score on all European capitals',
    imageUrl: '/trophies/europe-master.png',
    points: 1000,
    category: 'achievement',
    condition: {
      type: 'perfect_score',
      value: 1,
      region: 'europe',
    },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Answer 10 capitals in under 30 seconds',
    imageUrl: '/trophies/speed-demon.png',
    points: 500,
    category: 'achievement',
    condition: {
      type: 'speed',
      value: 30,
    },
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    imageUrl: '/trophies/streak-master.png',
    points: 750,
    category: 'achievement',
    condition: {
      type: 'streak',
      value: 7,
    },
  },
];

export const purchasableTrophies: PurchasableTrophy[] = [
  {
    id: 'gold-globe',
    name: 'Golden Globe',
    description: 'A beautiful golden globe trophy',
    imageUrl: '/trophies/gold-globe.png',
    points: 0,
    category: 'purchasable',
    price: 2000,
  },
  {
    id: 'crystal-compass',
    name: 'Crystal Compass',
    description: 'A crystal compass that always points to adventure',
    imageUrl: '/trophies/crystal-compass.png',
    points: 0,
    category: 'purchasable',
    price: 1500,
  },
  {
    id: 'platinum-map',
    name: 'Platinum World Map',
    description: 'A platinum-plated world map',
    imageUrl: '/trophies/platinum-map.png',
    points: 0,
    category: 'purchasable',
    price: 3000,
  },
];
