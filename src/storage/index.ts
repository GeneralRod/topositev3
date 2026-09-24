// De opslag zoals de rest van de app die gebruikt. Houdt een kopie in het
// geheugen bij en schrijft elke wijziging meteen weg naar localStorage.

import type { GameState } from '../game/rules';
import { loadSaveData, writeSaveData, type KeyValueStore, type SaveData } from './storage';

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
export function buyItem(kind: 'prize' | 'sticker', id: string, price: number): boolean {
  const current = state();
  const owned = kind === 'prize' ? current.prizes : current.stickers;
  if (owned.includes(id) || price < 0 || current.coins < price) return false;
  update((d) =>
    kind === 'prize'
      ? { ...d, coins: d.coins - price, prizes: [...d.prizes, id] }
      : { ...d, coins: d.coins - price, stickers: [...d.stickers, id] },
  );
  return true;
}

/** Alleen voor de ontwikkelaarsknoppen: kast helemaal leeg of vol zetten. */
export function setCollection(prizes: string[], stickers: string[]): void {
  update((d) => ({ ...d, prizes, stickers }));
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
