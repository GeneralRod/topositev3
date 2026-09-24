// De opslag zoals de rest van de app die gebruikt. Houdt een kopie in het
// geheugen bij en schrijft elke wijziging meteen weg naar localStorage.

import type { GameState } from '../game/rules';
import { recordAnswer, type AnswerKind, type CityStats } from '../game/progress';
import {
  loadSaveData,
  writeSaveData,
  type KeyValueStore,
  type PlayMode,
  type SaveData,
} from './storage';

export type { PlayMode } from './storage';

function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

function browserStore(): KeyValueStore {
  try {
    const store = window.localStorage;
    store.getItem('test');
    return store;
  } catch {
    // localStorage geblokkeerd: dan alleen in het geheugen.
    return memoryStore();
  }
}

let store: KeyValueStore | null = null;
let data: SaveData | null = null;

function state(): SaveData {
  if (!data) {
    store ??= browserStore();
    data = loadSaveData(store);
  }
  return data;
}

function update(change: (current: SaveData) => SaveData): void {
  data = change(state());
  writeSaveData(store!, data);
}

/** Alleen voor tests: gebruik een andere opslag en vergeet de kopie in het geheugen. */
export function setStoreForTesting(testStore: KeyValueStore): void {
  store = testStore;
  data = null;
}

export function getCoins(): number {
  return state().coins;
}

export function addCoins(amount: number): void {
  if (amount <= 0) return;
  update((d) => ({ ...d, coins: d.coins + amount }));
}

/** Zet het aantal munten direct (alleen voor de ontwikkelaarsknoppen in de prijzenkast). */
export function setCoins(amount: number): void {
  update((d) => ({ ...d, coins: Math.max(0, Math.floor(amount)) }));
}

/** Geef munten uit; lukt alleen als er genoeg zijn. */
export function spendCoins(amount: number): boolean {
  if (amount < 0 || state().coins < amount) return false;
  update((d) => ({ ...d, coins: d.coins - amount }));
  return true;
}

export function getPrizes(): string[] {
  return state().prizes;
}

export function getStickers(): string[] {
  return state().stickers;
}

/**
 * Koop een prijs of sticker: munten eraf en toevoegen in één stap.
 * Lukt niet als je hem al hebt of niet genoeg munten hebt.
 */
export type ItemKind = 'prize' | 'sticker' | 'upgrade';

const LISTS = { prize: 'prizes', sticker: 'stickers', upgrade: 'upgrades' } as const;

export function buyItem(kind: ItemKind, id: string, price: number): boolean {
  const current = state();
  const list = LISTS[kind];
  if (current[list].includes(id) || price < 0 || current.coins < price) return false;
  update((d) => ({ ...d, coins: d.coins - price, [list]: [...d[list], id] }));
  return true;
}

export function getUpgrades(): string[] {
  return state().upgrades;
}

export function getStyle(): SaveData['style'] {
  return state().style;
}

export function setStyle(style: SaveData['style']): void {
  update((d) => ({ ...d, style }));
}

/** Alleen voor de ontwikkelaarsknoppen: kast helemaal leeg of vol zetten. */
export function setCollection(prizes: string[], stickers: string[], upgrades: string[] = []): void {
  update((d) => ({ ...d, prizes, stickers, upgrades }));
}

export function loadGame(packageId: string): GameState | null {
  return state().games[packageId] ?? null;
}

export function saveGame(packageId: string, game: GameState): void {
  update((d) => ({ ...d, games: { ...d.games, [packageId]: game } }));
}

export function clearGame(packageId: string): void {
  update((d) => {
    const games = { ...d.games };
    delete games[packageId];
    return { ...d, games };
  });
}

export function getCityStats(categoryId: string): CityStats {
  return state().cityStats[categoryId] ?? {};
}

export function recordCityAnswer(categoryId: string, city: string, kind: AnswerKind): void {
  update((d) => ({
    ...d,
    cityStats: {
      ...d.cityStats,
      [categoryId]: recordAnswer(d.cityStats[categoryId] ?? {}, city, kind),
    },
  }));
}

export function getStars(): Record<string, number> {
  return state().stars;
}

/** Bewaar sterren voor een pakket; alleen als het beter is dan eerder. */
export function recordStars(packageId: string, stars: number): void {
  if ((state().stars[packageId] ?? 0) >= stars) return;
  update((d) => ({ ...d, stars: { ...d.stars, [packageId]: stars } }));
}

export function getPlayMode(): PlayMode {
  return state().prefs.playMode;
}

export function setPlayMode(playMode: PlayMode): void {
  update((d) => ({ ...d, prefs: { ...d.prefs, playMode } }));
}
