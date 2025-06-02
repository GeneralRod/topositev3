export interface Prize {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'ribbon' | 'trophy' | 'globe' | 'compass' | 'map' | 'decoration' | 'book' | 'binoculars' | 'atlas' | 'cup' | 'medal' | 'camera' | 'ship' | 'mountain' | 'special';
  icon: string | React.ComponentType<{ width?: number; height?: number }>; // emoji, SVG path, or React component
  spot: number; // where in the cabinet it goes
  max?: number; // for ribbons
  shelf?: 1 | 2 | 3; // for real prizes, which shelf (1=bottom, 2=middle, 3=top)
}

// Import SVGs as React components
import GlobeIcon from '../assets/globe.svg';
import DiamondIcon from '../assets/diamond.svg';
import MapIcon from '../assets/map.svg';
import MountainIcon from '../assets/mountain.svg';
import CompassIcon from '../assets/compass.svg';

export const prizes: Prize[] = [
  {
    id: 'ribbon-red',
    name: 'Rood lint',
    description: 'Een simpel rood lint om je kast te versieren.',
    price: 100,
    type: 'ribbon',
    icon: '🎗️', // red ribbon
    spot: 1,
    max: 5,
  },
  {
    id: 'ribbon-blue',
    name: 'Blauw lint',
    description: 'Een simpel blauw lint voor je verzameling.',
    price: 120,
    type: 'ribbon',
    icon: '💙', // blue heart as a stand-in for blue ribbon
    spot: 2,
    max: 5,
  },
  {
    id: 'ribbon-gold',
    name: 'Gouden lint',
    description: 'Een glanzend gouden lint voor speciale prestaties.',
    price: 200,
    type: 'ribbon',
    icon: '🏅', // gold medal as gold ribbon
    spot: 3,
    max: 5,
  },
  {
    id: 'mini-trophy',
    name: 'Mini trofee',
    description: 'Een kleine trofee voor je inzet.',
    price: 400,
    type: 'trophy',
    icon: '🏆',
    spot: 4,
    shelf: 1,
  },
  {
    id: 'silver-trophy',
    name: 'Zilveren trofee',
    description: 'Een glanzende zilveren trofee.',
    price: 800,
    type: 'trophy',
    icon: '🥈',
    spot: 5,
    shelf: 1,
  },
  {
    id: 'gold-trophy',
    name: 'Gouden trofee',
    description: 'Een prestigieuze gouden trofee.',
    price: 1200,
    type: 'trophy',
    icon: '🥇',
    spot: 6,
    shelf: 1,
  },
  {
    id: 'globe',
    name: 'Wereldbol',
    description: 'Een prachtige wereldbol voor topografiemeesters.',
    price: 2500,
    type: 'globe',
    icon: '🌍',
    spot: 7,
    shelf: 2,
  },
  {
    id: 'compass',
    name: 'Ontdekkerskompas',
    description: 'Een kompas voor echte ontdekkingsreizigers.',
    price: 2000,
    type: 'compass',
    icon: '🧭',
    spot: 8,
    shelf: 2,
  },
  {
    id: 'map',
    name: 'Oude kaart',
    description: 'Een zeldzame kaart voor in je kast.',
    price: 3000,
    type: 'map',
    icon: '🗺️',
    spot: 9,
    shelf: 2,
  },
  {
    id: 'door-sticker',
    name: 'Deur-sticker',
    description: 'Versier je kastdeuren met een leuke sticker.',
    price: 150,
    type: 'decoration',
    icon: '⭐',
    spot: 10,
  },
  {
    id: 'door-ribbon',
    name: 'Deurlint',
    description: 'Een lint om aan je kastdeur te hangen.',
    price: 180,
    type: 'decoration',
    icon: '🎉',
    spot: 11,
  },
  // New real prizes
  {
    id: 'book',
    name: 'Boek',
    description: 'Een dik aardrijkskundeboek voor in je kast.',
    price: 700,
    type: 'book',
    icon: '📚',
    spot: 12,
    shelf: 1,
  },
  {
    id: 'binoculars',
    name: 'Verrekijker',
    description: 'Voor de echte ontdekkingsreiziger.',
    price: 900,
    type: 'binoculars',
    icon: '🔭',
    spot: 13,
    shelf: 2,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    description: 'Een wereldatlas vol kaarten.',
    price: 1100,
    type: 'atlas',
    icon: '🗃️',
    spot: 14,
    shelf: 2,
  },
  {
    id: 'cup',
    name: 'Beker',
    description: 'Een grote beker voor de winnaar.',
    price: 1500,
    type: 'cup',
    icon: '🏆',
    spot: 15,
    shelf: 1,
  },
  // More prizes
  {
    id: 'medal',
    name: 'Medaillon',
    description: 'Een mooie medaille voor bijzondere prestaties.',
    price: 950,
    type: 'medal',
    icon: '🎖️',
    spot: 16,
    shelf: 3,
  },
  {
    id: 'camera',
    name: 'Camera',
    description: 'Leg je ontdekkingen vast met deze camera.',
    price: 850,
    type: 'camera',
    icon: '📷',
    spot: 17,
    shelf: 3,
  },
  {
    id: 'ship',
    name: 'Schip',
    description: 'Voor de avonturier die de wereldzeeën wil bevaren.',
    price: 1300,
    type: 'ship',
    icon: '⛵',
    spot: 18,
    shelf: 1,
  },
  {
    id: 'mountain',
    name: 'Berg',
    description: 'Voor de topografische bergbeklimmer.',
    price: 1200,
    type: 'mountain',
    icon: '⛰️',
    spot: 19,
    shelf: 2,
  },
];

export const specialPrizes = [
  {
    id: 'globe',
    name: 'Globe',
    description: 'Een prachtige wereldbol voor topografiemeesters.',
    price: 100,
    type: 'special',
    icon: GlobeIcon,
    shelf: 2,
  },
  {
    id: 'diamond',
    name: 'Diamant',
    description: 'Een schitterende diamant voor bijzondere prestaties.',
    price: 120,
    type: 'special',
    icon: DiamondIcon,
    shelf: 2,
  },
  {
    id: 'map',
    name: 'Kaart',
    description: 'Een oude kaart voor echte ontdekkingsreizigers.',
    price: 90,
    type: 'special',
    icon: MapIcon,
    shelf: 3,
  },
  {
    id: 'mountain',
    name: 'Berg',
    description: 'Voor de topografische bergbeklimmer.',
    price: 110,
    type: 'special',
    icon: MountainIcon,
    shelf: 1,
  },
  {
    id: 'compass',
    name: 'Kompas',
    description: 'Een kompas voor echte ontdekkingsreizigers.',
    price: 95,
    type: 'special',
    icon: CompassIcon,
    shelf: 3,
  },
]; 