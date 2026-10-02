// Twee versies van de voortgang samenvoegen: wat er online bij het account staat
// en wat er in deze browser staat. Zo gaat er bij inloggen niets verloren.
// Pure functies, getest in merge.test.ts. De regels staan ook in PLAN.md (fase 7).
//
// Er is steeds een derde versie bij: de basis, dat is hoe het er uitzag bij het
// laatste bijwerken met het account. Dan is te zien welke kant iets veranderd
// heeft, en tellen munten en fouten van beide kanten maar één keer. Heeft deze
// browser nog nooit met dit account bijgewerkt, dan is de basis leeg.

import type { GameState } from '../game/rules';
import type { CityStat, CityStats } from '../game/progress';
import type { DailyRecord } from '../game/daily';
import { emptySaveData, STORAGE_VERSION, type SaveData } from './storage';

export function mergeSaveData(base: SaveData | null, local: SaveData, remote: SaveData): SaveData {
  const b = base ?? emptySaveData();
  return {
    version: STORAGE_VERSION,
    coins: Math.max(0, remote.coins + local.coins - b.coins),
    prizes: mergeList(b.prizes, local.prizes, remote.prizes),
    stickers: mergeList(b.stickers, local.stickers, remote.stickers),
    upgrades: mergeList(b.upgrades, local.upgrades, remote.upgrades),
    style: pickChanged(b.style, local.style, remote.style),
    games: mergeGames(b.games, local.games, remote.games),
    cityStats: mergeCityStats(b.cityStats, local.cityStats, remote.cityStats),
    stars: mergeBest(b.stars, local.stars, remote.stars),
    prefs: pickChanged(b.prefs, local.prefs, remote.prefs),
    daily: mergeDaily(local.daily, remote.daily),
    achievements: mergeList(b.achievements, local.achievements, remote.achievements),
    toetsen: mergeBest(b.toetsen, local.toetsen, remote.toetsen),
  };
}

/** Zelfde inhoud? Volgorde van sleutels maakt niet uit, volgorde in lijsten wel. */
export function sameData(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every((key) => key in right && sameData(left[key], right[key]));
}

/**
 * Lijsten (prijzen, stickers, ...): wat een kant sinds de basis toevoegde komt
 * erbij, wat een kant bewust weghaalde (bijv. de beheerder) blijft weg. Zonder
 * basis (eerste keer inloggen): alles van beide kanten.
 */
function mergeList(base: string[], local: string[], remote: string[]): string[] {
  const before = new Set(base);
  const here = new Set(local);
  const there = new Set(remote);
  return Array.from(new Set([...remote, ...local])).filter(
    (id) => (here.has(id) && there.has(id)) || !before.has(id),
  );
}

/**
 * Sterren en cijfers: is maar één kant veranderd, dan die kant (ook als het
 * lager werd, bijv. door de beheerder); allebei veranderd: het beste.
 */
function mergeBest(
  base: Record<string, number>,
  local: Record<string, number>,
  remote: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of new Set([...Object.keys(remote), ...Object.keys(local)])) {
    const value =
      local[key] === base[key]
        ? remote[key]
        : remote[key] === base[key]
          ? local[key]
          : Math.max(local[key] ?? 0, remote[key] ?? 0);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Heeft deze browser iets veranderd, dan dat; anders wat er online staat. */
function pickChanged<T>(base: T, local: T, remote: T): T {
  return sameData(local, base) ? remote : local;
}

/** Hoe ver je in een spel bent: aantal gevonden plekken. */
function progress(game: GameState): number {
  return Object.values(game.status).filter((status) => status !== 'unanswered').length;
}

function mergeGames(
  base: Record<string, GameState>,
  local: Record<string, GameState>,
  remote: Record<string, GameState>,
): Record<string, GameState> {
  const out: Record<string, GameState> = {};
  const ids = new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)]);
  for (const id of ids) {
    const game = mergeGame(base[id], local[id], remote[id]);
    if (game) out[id] = game;
  }
  return out;
}

function mergeGame(
  base: GameState | undefined,
  local: GameState | undefined,
  remote: GameState | undefined,
): GameState | undefined {
  // Maar één kant veranderd (ook een gewist spel telt): neem die kant.
  if (sameData(local, base)) return remote;
  if (sameData(remote, base)) return local;
  // Allebei veranderd: het spel waarin je het verst bent. Gewist tegen gespeeld: gespeeld.
  if (!local || !remote) return local ?? remote;
  return progress(remote) > progress(local) ? remote : local;
}

function mergeCityStats(
  base: Record<string, CityStats>,
  local: Record<string, CityStats>,
  remote: Record<string, CityStats>,
): Record<string, CityStats> {
  const out: Record<string, CityStats> = {};
  for (const categoryId of new Set([...Object.keys(local), ...Object.keys(remote)])) {
    const b = base[categoryId] ?? {};
    const l = local[categoryId] ?? {};
    const r = remote[categoryId] ?? {};
    out[categoryId] = {};
    for (const city of new Set([...Object.keys(l), ...Object.keys(r)])) {
      out[categoryId][city] = mergeCityStat(b[city], l[city], r[city]);
    }
  }
  return out;
}

function mergeCityStat(
  base: CityStat | undefined,
  local: CityStat | undefined,
  remote: CityStat | undefined,
): CityStat {
  const b = base ?? { wrong: 0, streak: 0 };
  const l = local ?? b;
  const r = remote ?? b;
  return {
    // Fouten die aan beide kanten sinds de basis bijkwamen, tellen allebei.
    wrong: Math.max(0, r.wrong + l.wrong - b.wrong),
    // De reeks van de kant waar sinds de basis gespeeld is.
    streak: sameData(l, b) ? r.streak : l.streak,
  };
}

function mergeDaily(
  local: Record<string, DailyRecord>,
  remote: Record<string, DailyRecord>,
): Record<string, DailyRecord> {
  const out = { ...remote };
  for (const [categoryId, l] of Object.entries(local)) {
    const r = out[categoryId];
    out[categoryId] = r ? laterDaily(l, r) : l;
  }
  return out;
}

/** De recentste dag; op dezelfde dag de langste reeks. */
function laterDaily(a: DailyRecord, b: DailyRecord): DailyRecord {
  const dayA = a.lastCompleted ?? '';
  const dayB = b.lastCompleted ?? '';
  if (dayA !== dayB) return dayA > dayB ? a : b;
  return a.streak >= b.streak ? a : b;
}
