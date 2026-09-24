// Eén plek voor alles wat de site in de browser (localStorage) bewaart.
//
// Alles staat onder één sleutel met een versienummer. Gegevens uit de oude
// losse sleutels worden bij het eerste bezoek automatisch overgezet, zodat
// spelers hun munten, prijzen en voortgang houden. De oude sleutels blijven
// staan (worden alleen gelezen), zodat terugrollen naar de oude site veilig is.
//
// Versies:
//   1: munten, linten (aantallen), 'echte' prijzen en spellen
//   2: munten, prijzen, stickers en spellen (nieuwe prijzenkast). Linten en
//      prijzen die niet meer bestaan worden omgezet in munten (zie migrations.ts).
//      Later toegevoegd (zonder nieuw versienummer, ontbreekt = standaard):
//      kast-upgrades en de gekozen kaststijl, statistieken per stad (lastige
//      steden), de beste sterren per pakket, de dagelijkse uitdaging en de
//      verdiende prestatieprijzen.

import type { CityStatus, GameState } from '../game/rules';
import type { CityStats } from '../game/progress';
import type { DailyRecord } from '../game/daily';
import { upgradeCollection } from './migrations';

export const STORAGE_KEY = 'topografiewereld';
export const STORAGE_VERSION = 2;

export const LEGACY_KEYS = {
  coins: 'topositev2_total_coins',
  ribbons: 'topositev2_ribbons_owned',
  realPrizes: 'topositev2_real_prizes_owned',
  gamePrefix: 'topografie_game_state_',
} as const;

export interface SaveData {
  version: number;
  coins: number;
  /** Id's van gekochte prijzen in de prijzenkast. */
  prizes: string[];
  /** Id's van gekochte stickers. */
  stickers: string[];
  /** Id's van gekochte kast-upgrades (kleuren en extra's). */
  upgrades: string[];
  /** Hoe de kast er nu uitziet. */
  style: { finish: string; extras: string[] };
  /** Lopende spellen per pakket-id (bijv. 'pakket1-2'). */
  games: Record<string, GameState>;
  /** Fouten en reeksen per stad, per onderwerp (categorie-id). */
  cityStats: Record<string, CityStats>;
  /** Beste aantal sterren (1-3) per pakket-id. */
  stars: Record<string, number>;
  /** Voorkeuren van de speler. */
  prefs: Prefs;
  /** Dagelijkse uitdaging per onderwerp (categorie-id). */
  daily: Record<string, DailyRecord>;
  /** Id's van verdiende prestatieprijzen (niet te koop). */
  achievements: string[];
}

export type PlayMode = 'map' | 'choice';

export interface Prefs {
  /** Aanwijzen op de kaart of meerkeuze. */
  playMode: PlayMode;
}

function parseDaily(value: unknown): Record<string, DailyRecord> {
  const out: Record<string, DailyRecord> = {};
  if (!isRecord(value)) return out;
  for (const [categoryId, record] of Object.entries(value)) {
    if (!isRecord(record)) continue;
    const last = record.lastCompleted;
    out[categoryId] = {
      lastCompleted: typeof last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(last) ? last : null,
      streak: toCount(record.streak),
    };
  }
  return out;
}

function parsePrefs(value: unknown): Prefs {
  const playMode = isRecord(value) && value.playMode === 'choice' ? 'choice' : 'map';
  return { playMode };
}

/** Het oude formaat (versie 1 en de losse sleutels daarvoor). */
export interface SaveDataV1 {
  coins: number;
  /** Aantal linten per lint-id. */
  ribbons: Record<string, number>;
  /** Id's van gekochte 'echte' prijzen. */
  realPrizes: string[];
  games: Record<string, GameState>;
}

/** Het deel van de Storage-API dat we gebruiken; in tests een nep-versie. */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem' | 'key' | 'length'>;

export function emptySaveData(): SaveData {
  return {
    version: STORAGE_VERSION,
    coins: 0,
    prizes: [],
    stickers: [],
    upgrades: [],
    style: defaultStyle(),
    games: {},
    cityStats: {},
    stars: {},
    prefs: { playMode: 'map' },
    daily: {},
    achievements: [],
  };
}

export function defaultStyle(): SaveData['style'] {
  return { finish: 'oak', extras: [] };
}

function parseCityStats(value: unknown): Record<string, CityStats> {
  const out: Record<string, CityStats> = {};
  if (!isRecord(value)) return out;
  for (const [categoryId, cities] of Object.entries(value)) {
    if (!isRecord(cities)) continue;
    out[categoryId] = {};
    for (const [city, stat] of Object.entries(cities)) {
      if (!isRecord(stat)) continue;
      out[categoryId][city] = { wrong: toCount(stat.wrong), streak: toCount(stat.streak) };
    }
  }
  return out;
}

function parseStars(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!isRecord(value)) return out;
  for (const [packageId, stars] of Object.entries(value)) {
    const n = toCount(stars);
    if (n >= 1) out[packageId] = Math.min(3, n);
  }
  return out;
}

function parseStyle(value: unknown): SaveData['style'] {
  if (!isRecord(value)) return defaultStyle();
  return {
    finish: typeof value.finish === 'string' ? value.finish : 'oak',
    extras: toIdList(value.extras),
  };
}

function emptySaveDataV1(): SaveDataV1 {
  return { coins: 0, ribbons: {}, realPrizes: [], games: {} };
}

function toIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((id): id is string => typeof id === 'string')));
}

/** Zet gegevens in het oude formaat om naar versie 2. */
export function upgradeV1(old: SaveDataV1): SaveData {
  const { prizes, refund } = upgradeCollection(old.realPrizes, old.ribbons);
  return {
    version: STORAGE_VERSION,
    coins: old.coins + refund,
    prizes,
    stickers: [],
    upgrades: [],
    style: defaultStyle(),
    games: old.games,
    cityStats: {},
    stars: {},
    prefs: { playMode: 'map' },
    daily: {},
    achievements: [],
  };
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
    hintsUsed: toCount(value.hintsUsed),
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
    hintsUsed: toCount(value.hintsUsed),
    coinsThisGame: toCount(value.coinsThisGame),
    bonusPaid: Object.keys(status).length > 0 && allGreen,
  };
}

/** Lees alle oude losse sleutels (van voor versie 1) in het oude formaat. */
export function migrateLegacy(store: KeyValueStore): SaveDataV1 {
  const data = emptySaveDataV1();
  data.coins = toCount(store.getItem(LEGACY_KEYS.coins));
  data.ribbons = toCountMap(parseJson(store.getItem(LEGACY_KEYS.ribbons)));
  data.realPrizes = toIdList(parseJson(store.getItem(LEGACY_KEYS.realPrizes)));

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key?.startsWith(LEGACY_KEYS.gamePrefix)) continue;
    const packageId = key.slice(LEGACY_KEYS.gamePrefix.length);
    const game = migrateLegacyGame(parseJson(store.getItem(key)));
    if (packageId && game) data.games[packageId] = game;
  }
  return data;
}

function parseGames(value: unknown): Record<string, GameState> {
  const games: Record<string, GameState> = {};
  if (isRecord(value)) {
    for (const [packageId, raw] of Object.entries(value)) {
      const game = toGameState(raw);
      if (game) games[packageId] = game;
    }
  }
  return games;
}

/**
 * Controleer opgeslagen gegevens onder de nieuwe sleutel; ongeldige delen
 * vallen weg. Versie 1 wordt meteen omgezet naar versie 2.
 */
export function parseSaveData(value: unknown): SaveData | null {
  if (!isRecord(value) || typeof value.version !== 'number') return null;
  if (value.version < 2) {
    return upgradeV1({
      coins: toCount(value.coins),
      ribbons: toCountMap(value.ribbons),
      realPrizes: toIdList(value.realPrizes),
      games: parseGames(value.games),
    });
  }
  return {
    version: STORAGE_VERSION,
    coins: toCount(value.coins),
    prizes: toIdList(value.prizes),
    stickers: toIdList(value.stickers),
    upgrades: toIdList(value.upgrades),
    style: parseStyle(value.style),
    games: parseGames(value.games),
    cityStats: parseCityStats(value.cityStats),
    stars: parseStars(value.stars),
    prefs: parsePrefs(value.prefs),
    daily: parseDaily(value.daily),
    achievements: toIdList(value.achievements),
  };
}

/**
 * Laad de gegevens. Bestaat de nieuwe sleutel nog niet, dan worden de oude
 * sleutels overgezet. Een omzetting wordt meteen bewaard, zodat die maar één
 * keer gebeurt (en munten-terugbetaling dus ook maar één keer).
 */
export function loadSaveData(store: KeyValueStore): SaveData {
  const raw = parseJson(store.getItem(STORAGE_KEY));
  const current = parseSaveData(raw);
  if (current) {
    if (isRecord(raw) && raw.version !== STORAGE_VERSION) writeSaveData(store, current);
    return current;
  }
  const migrated = upgradeV1(migrateLegacy(store));
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
