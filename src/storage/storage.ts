// Eén plek voor alles wat de site in de browser (localStorage) bewaart.
//
// Alles staat onder één sleutel met een versienummer. Gegevens uit de oude
// losse sleutels worden bij het eerste bezoek automatisch overgezet, zodat
// spelers hun munten, prijzen en voortgang houden. De oude sleutels blijven
// staan (worden alleen gelezen), zodat terugrollen naar de oude site veilig is.

import type { CityStatus, GameState } from '../game/rules';

export const STORAGE_KEY = 'topografiewereld';
export const STORAGE_VERSION = 1;

export const LEGACY_KEYS = {
  coins: 'topositev2_total_coins',
  ribbons: 'topositev2_ribbons_owned',
  realPrizes: 'topositev2_real_prizes_owned',
  gamePrefix: 'topografie_game_state_',
} as const;

export interface SaveData {
  version: number;
  coins: number;
  /** Aantal linten per prijs-id. */
  ribbons: Record<string, number>;
  /** Id's van gekochte echte prijzen. */
  realPrizes: string[];
  /** Lopende spellen per pakket-id (bijv. 'pakket1-2'). */
  games: Record<string, GameState>;
}

/** Het deel van de Storage-API dat we gebruiken; in tests een nep-versie. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'key' | 'length'>;

export function emptySaveData(): SaveData {
  return { version: STORAGE_VERSION, coins: 0, ribbons: {}, realPrizes: [], games: {} };
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toCount(value: unknown): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : value;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

const STATUSES: CityStatus[] = ['unanswered', 'blue', 'green'];

function toStatusMap(value: unknown): Record<string, CityStatus> {
  if (!isRecord(value)) return {};
  const out: Record<string, CityStatus> = {};
  for (const [name, status] of Object.entries(value)) {
    if (STATUSES.includes(status as CityStatus)) out[name] = status as CityStatus;
  }
  return out;
}

function toCountMap(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toCount(v)]));
}

/** Controleer een spel in het nieuwe formaat; ongeldig → null. */
function toGameState(value: unknown): GameState | null {
  if (!isRecord(value) || !isRecord(value.status)) return null;
  return {
    status: toStatusMap(value.status),
    mistakes: toCountMap(value.mistakes),
    currentCity: typeof value.currentCity === 'string' ? value.currentCity : null,
    attempts: toCount(value.attempts),
    hintUsed: value.hintUsed === true,
    coinsThisGame: toCount(value.coinsThisGame),
    bonusPaid: value.bonusPaid === true,
  };
}

/**
 * Zet een spel uit het oude formaat om. Het oude spel keerde de eindbonus
 * direct uit zodra alles groen was, dus een afgerond oud spel telt als
 * 'bonus al betaald'.
 */
export function migrateLegacyGame(value: unknown): GameState | null {
  if (!isRecord(value) || !isRecord(value.cityStatus)) return null;
  const status = toStatusMap(value.cityStatus);
  const current = isRecord(value.currentCity) ? value.currentCity.name : null;
  const allGreen = Object.values(status).every((s) => s === 'green');
  return {
    status,
    mistakes: toCountMap(value.cityMistakes),
    currentCity: typeof current === 'string' ? current : null,
    attempts: toCount(value.currentAttempts),
    hintUsed: value.hintUsed === true,
    coinsThisGame: toCount(value.coinsThisGame),
    bonusPaid: Object.keys(status).length > 0 && allGreen,
  };
}

/** Lees alle oude losse sleutels en zet ze om naar het nieuwe formaat. */
export function migrateLegacy(store: KeyValueStore): SaveData {
  const data = emptySaveData();
  data.coins = toCount(store.getItem(LEGACY_KEYS.coins));

  const ribbons = parseJson(store.getItem(LEGACY_KEYS.ribbons));
  data.ribbons = toCountMap(ribbons);

  const realPrizes = parseJson(store.getItem(LEGACY_KEYS.realPrizes));
  if (Array.isArray(realPrizes)) {
    data.realPrizes = realPrizes.filter((id): id is string => typeof id === 'string');
  }

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key?.startsWith(LEGACY_KEYS.gamePrefix)) continue;
    const packageId = key.slice(LEGACY_KEYS.gamePrefix.length);
    const game = migrateLegacyGame(parseJson(store.getItem(key)));
    if (packageId && game) data.games[packageId] = game;
  }
  return data;
}

/** Controleer opgeslagen gegevens in het nieuwe formaat; ongeldige delen vallen weg. */
export function parseSaveData(value: unknown): SaveData | null {
  if (!isRecord(value) || typeof value.version !== 'number') return null;
  const data = emptySaveData();
  data.coins = toCount(value.coins);
  data.ribbons = toCountMap(value.ribbons);
  if (Array.isArray(value.realPrizes)) {
    data.realPrizes = value.realPrizes.filter((id): id is string => typeof id === 'string');
  }
  if (isRecord(value.games)) {
    for (const [packageId, raw] of Object.entries(value.games)) {
      const game = toGameState(raw);
      if (game) data.games[packageId] = game;
    }
  }
  return data;
}

/**
 * Laad de gegevens. Bestaat de nieuwe sleutel nog niet, dan worden de oude
 * sleutels overgezet en meteen in het nieuwe formaat bewaard.
 */
export function loadSaveData(store: KeyValueStore): SaveData {
  const current = parseSaveData(parseJson(store.getItem(STORAGE_KEY)));
  if (current) return current;
  const migrated = migrateLegacy(store);
  writeSaveData(store, migrated);
  return migrated;
}

export function writeSaveData(store: KeyValueStore, data: SaveData): boolean {
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: STORAGE_VERSION }));
    return true;
  } catch {
    // Opslag vol of geblokkeerd (bijv. privévenster): spel werkt door, maar zonder bewaren.
    return false;
  }
}
