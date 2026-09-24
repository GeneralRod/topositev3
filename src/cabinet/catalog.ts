// Alles wat je in de prijzenkast kunt verdienen. De plaatjes staan in art.tsx
// (zelfde id). Prijzen: één keer pakket 1 spelen levert ongeveer 450 munten op.

export interface CabinetItem {
  /** Vaste sleutel voor opslag; niet meer wijzigen als hij eenmaal live staat. */
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Shelf {
  id: string;
  title: string;
  /** Precies 4 prijzen per plank, van links naar rechts. */
  items: CabinetItem[];
}

export const shelves: Shelf[] = [
  {
    id: 'trofeeen',
    title: 'Trofeeën',
    items: [
      {
        id: 'mini-trophy',
        name: 'Bronzen trofee',
        description: 'Je eerste echte trofee!',
        price: 800,
      },
      {
        id: 'silver-trophy',
        name: 'Zilveren trofee',
        description: 'Een glanzende zilveren trofee.',
        price: 1500,
      },
      {
        id: 'gold-trophy',
        name: 'Gouden trofee',
        description: 'Alleen voor echte topografiekampioenen.',
        price: 2500,
      },
      {
        id: 'cup',
        name: 'Kampioensbeker',
        description: 'De grootste beker van de hele kast.',
        price: 4000,
      },
    ],
  },
  {
    id: 'wereld',
    title: 'De wereld',
    items: [
      {
        id: 'book',
        name: 'Aardrijkskundeboek',
        description: 'Een dik boek vol landen en steden.',
        price: 400,
      },
      {
        id: 'atlas',
        name: 'Atlas',
        description: 'Een wereldatlas vol kaarten.',
        price: 800,
      },
      {
        id: 'map',
        name: 'Schatkaart',
        description: 'Een oude kaart. Waar zou de schat liggen?',
        price: 1200,
      },
      {
        id: 'globe',
        name: 'Wereldbol',
        description: 'Een draaiende wereldbol voor topografiemeesters.',
        price: 2000,
      },
    ],
  },
  {
    id: 'ontdekkers',
    title: 'Ontdekkers',
    items: [
      {
        id: 'compass',
        name: 'Kompas',
        description: 'Zo verdwaal je nooit meer.',
        price: 300,
      },
      {
        id: 'binoculars',
        name: 'Verrekijker',
        description: 'Kijk ver weg, tot aan de horizon.',
        price: 500,
      },
      {
        id: 'camera',
        name: 'Camera',
        description: 'Maak foto’s van al je ontdekkingen.',
        price: 700,
      },
      {
        id: 'ship',
        name: 'Zeilschip',
        description: 'Voor wie de wereldzeeën wil bevaren.',
        price: 900,
      },
    ],
  },
  {
    id: 'schatten',
    title: 'Schatten',
    items: [
      {
        id: 'medal',
        name: 'Medaille',
        description: 'Een medaille voor doorzetters.',
        price: 600,
      },
      {
        id: 'mountain',
        name: 'Bergkristal',
        description: 'Een glinsterende steen van de hoogste berg.',
        price: 1000,
      },
      {
        id: 'diamond',
        name: 'Diamant',
        description: 'Zeldzaam en schitterend.',
        price: 3000,
      },
      {
        id: 'crown',
        name: 'Kroon',
        description: 'Voor de koning of koningin van de topografie.',
        price: 5000,
      },
    ],
  },
  {
    id: 'wonderen',
    title: 'Wereldwonderen',
    items: [
      {
        id: 'windmill',
        name: 'Molen',
        description: 'Een echte Hollandse molen. De wieken draaien in de wind!',
        price: 700,
      },
      {
        id: 'eiffel',
        name: 'Eiffeltoren',
        description: 'De beroemde ijzeren toren uit Parijs, in Frankrijk.',
        price: 1400,
      },
      {
        id: 'pyramids',
        name: 'Piramides',
        description: 'Duizenden jaren oud, in de woestijn bij Caïro in Egypte.',
        price: 2200,
      },
      {
        id: 'liberty',
        name: 'Vrijheidsbeeld',
        description: 'Ze houdt haar fakkel hoog in de haven van New York.',
        price: 3500,
      },
    ],
  },
];

/** Stickers voor op de zijkanten van de kast. */
export const stickers: CabinetItem[] = [
  { id: 'star', name: 'Ster', description: 'Een vrolijke gele ster.', price: 100 },
  { id: 'sun', name: 'Zon', description: 'Altijd mooi weer in je kast.', price: 100 },
  { id: 'plane', name: 'Vliegtuig', description: 'Op reis naar verre landen.', price: 150 },
  { id: 'anchor', name: 'Anker', description: 'Voor echte zeevaarders.', price: 150 },
  { id: 'rainbow', name: 'Regenboog', description: 'Alle kleuren van de wereld.', price: 200 },
  { id: 'rocket', name: 'Raket', description: 'Nog verder dan de hele wereld!', price: 250 },
  { id: 'tulip', name: 'Tulp', description: 'De bekendste bloem van Nederland.', price: 150 },
  { id: 'palm', name: 'Palmboom', description: 'Een zonnig eiland in de zee.', price: 200 },
  { id: 'whale', name: 'Walvis', description: 'Het grootste dier van de oceaan.', price: 250 },
  { id: 'balloon', name: 'Luchtballon', description: 'Zweef hoog boven de wereld.', price: 300 },
];

export const allPrizes: CabinetItem[] = shelves.flatMap((shelf) => shelf.items);

/** Kleur van de kast. Eikenhout heb je altijd; de rest kun je kopen. */
export interface Finish extends CabinetItem {
  wood: string;
  woodLight: string;
  woodDark: string;
}

export const DEFAULT_FINISH = 'oak';

export const finishes: Finish[] = [
  {
    id: 'oak',
    name: 'Eikenhout',
    description: 'De gewone houten kast.',
    price: 0,
    wood: '#8b5a2b',
    woodLight: '#b07a45',
    woodDark: '#6b4226',
  },
  {
    id: 'cherry',
    name: 'Kersenhout',
    description: 'Warm roodbruin hout.',
    price: 400,
    wood: '#9b3b2a',
    woodLight: '#c0604a',
    woodDark: '#6e2518',
  },
  {
    id: 'walnut',
    name: 'Walnoot',
    description: 'Chic donker hout.',
    price: 600,
    wood: '#5a3a24',
    woodLight: '#7a5236',
    woodDark: '#3a2415',
  },
  {
    id: 'sea-blue',
    name: 'Zeeblauw',
    description: 'Geverfd in de kleur van de oceaan.',
    price: 900,
    wood: '#3f6f9f',
    woodLight: '#5f8fbf',
    woodDark: '#2a4d70',
  },
  {
    id: 'mint',
    name: 'Mintgroen',
    description: 'Fris geverfd, zoals een jungle.',
    price: 900,
    wood: '#4f9e80',
    woodLight: '#75bfa1',
    woodDark: '#35735b',
  },
  {
    id: 'pink',
    name: 'Snoeproze',
    description: 'Zo roze als een zuurstok.',
    price: 900,
    wood: '#d1719a',
    woodLight: '#e897b9',
    woodDark: '#a04c70',
  },
];

/** Extra's die je aan en uit kunt zetten zodra je ze hebt. */
export const extras: CabinetItem[] = [
  {
    id: 'lights',
    name: 'Lampjes',
    description: 'Warme lampjes die je prijzen laten stralen.',
    price: 1000,
  },
  {
    id: 'compass-rose',
    name: 'Windroos bovenop',
    description: 'Een gouden windroos boven op de kast.',
    price: 1200,
  },
  {
    id: 'gold-trim',
    name: 'Gouden randen',
    description: 'Alle randen en pootjes van goud.',
    price: 1500,
  },
  {
    id: 'sparkles',
    name: 'Glitters',
    description: 'Twinkelende sterretjes achter het glas.',
    price: 2000,
  },
];
