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
];

/** Stickers voor op de zijkanten van de kast. */
export const stickers: CabinetItem[] = [
  { id: 'star', name: 'Ster', description: 'Een vrolijke gele ster.', price: 100 },
  { id: 'sun', name: 'Zon', description: 'Altijd mooi weer in je kast.', price: 100 },
  { id: 'plane', name: 'Vliegtuig', description: 'Op reis naar verre landen.', price: 150 },
  { id: 'anchor', name: 'Anker', description: 'Voor echte zeevaarders.', price: 150 },
  { id: 'rainbow', name: 'Regenboog', description: 'Alle kleuren van de wereld.', price: 200 },
  { id: 'rocket', name: 'Raket', description: 'Nog verder dan de hele wereld!', price: 250 },
];

export const allPrizes: CabinetItem[] = shelves.flatMap((shelf) => shelf.items);
