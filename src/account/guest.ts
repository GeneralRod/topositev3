// Voortgang die al op deze computer stond voordat iemand inlogde. Bij de eerste
// keer inloggen op een computer vragen we of die van het kind is (wens eigenaar):
//   ja  -> samenvoegen met het account (zie sync.ts en storage/merge.ts)
//   nee -> apart bewaren; na uitloggen staat hij weer gewoon op de computer
// Zo raakt er nooit voortgang kwijt, ook niet op een gedeelde schoolcomputer.
// Pure functies, getest in guest.test.ts.

import { mergeSaveData, type SaveData } from '../storage';
import { parseSaveData } from '../storage/storage';

/** Hier staat de voortgang van de computer zolang iemand anders ingelogd is. */
export const GUEST_KEY = 'topografiewereld_gast';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Staat er iets in dat de moeite waard is om te bewaren? */
export function hasProgress(data: SaveData): boolean {
  return (
    data.coins > 0 ||
    data.prizes.length > 0 ||
    data.stickers.length > 0 ||
    data.upgrades.length > 0 ||
    data.achievements.length > 0 ||
    Object.keys(data.stars).length > 0 ||
    Object.keys(data.games).length > 0 ||
    Object.keys(data.cityStats).length > 0 ||
    Object.keys(data.toetsen).length > 0 ||
    Object.keys(data.daily).length > 0
  );
}

/**
 * Moeten we het vragen? Alleen als deze computer nog nooit met een account heeft
 * bijgewerkt (geen basis) en er voortgang staat. Hoort de basis bij een ander
 * account, dan is de voortgang van dat account (staat al online) en vragen we niets.
 */
export function needsGuestQuestion(base: { userId: string } | null, local: SaveData): boolean {
  return base === null && hasProgress(local);
}

/** "120 munten, 7 sterren en 3 prijzen" (wat er is). */
export function progressSummary(data: SaveData): string {
  const stars = Object.values(data.stars).reduce((sum, n) => sum + n, 0);
  const prizes = data.prizes.length + data.stickers.length;
  const parts = [
    data.coins > 0 ? `${data.coins} ${data.coins === 1 ? 'munt' : 'munten'}` : '',
    stars > 0 ? `${stars} ${stars === 1 ? 'ster' : 'sterren'}` : '',
    prizes > 0 ? `${prizes} ${prizes === 1 ? 'prijs' : 'prijzen'}` : '',
  ].filter(Boolean);
  if (parts.length === 0) return 'voortgang in de pakketten';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} en ${parts[parts.length - 1]}`;
}

/** De apart gezette voortgang, zonder hem weg te halen. */
export function readGuest(store: Store): SaveData | null {
  try {
    const raw = store.getItem(GUEST_KEY);
    return raw === null ? null : parseSaveData(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Voortgang van de computer apart zetten ("nee, niet van mij"). Stond er al iets
 * apart, dan komt dit erbij (er mag niets overschreven worden). Geeft false als
 * het niet lukt (opslag vol of geblokkeerd); dan moet de voortgang blijven staan.
 */
export function keepGuest(store: Store, data: SaveData): boolean {
  const earlier = readGuest(store);
  const kept = earlier ? mergeSaveData(null, earlier, data) : data;
  try {
    store.setItem(GUEST_KEY, JSON.stringify(kept));
    return sameJson(store.getItem(GUEST_KEY), kept);
  } catch {
    return false;
  }
}

function sameJson(raw: string | null, data: SaveData): boolean {
  return raw === JSON.stringify(data);
}

/** De apart gezette voortgang terugpakken en daarna opruimen (na uitloggen). */
export function takeGuest(store: Store): SaveData | null {
  const data = readGuest(store);
  try {
    store.removeItem(GUEST_KEY);
  } catch {
    // Niet op te ruimen: dan staat hij er de volgende keer nog, en komt hij er weer bij.
  }
  return data;
}
