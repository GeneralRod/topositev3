// Voortgang over meerdere spellen heen: welke steden lastig zijn en hoeveel
// sterren je per pakket hebt gehaald. Pure functies, getest in progress.test.ts.

export interface CityStat {
  /** Totaal aantal keer fout geklikt terwijl deze stad gevraagd werd. */
  wrong: number;
  /** Hoe vaak achter elkaar in één keer goed. */
  streak: number;
}

export type CityStats = Record<string, CityStat>;

/** Zo vaak achter elkaar in één keer goed, en de stad is niet meer lastig. */
export const MASTERED_STREAK = 2;

export type AnswerKind = 'wrong' | 'first-try' | 'after-mistake';

export function recordAnswer(stats: CityStats, city: string, kind: AnswerKind): CityStats {
  const current = stats[city] ?? { wrong: 0, streak: 0 };
  const next: CityStat =
    kind === 'wrong'
      ? { wrong: current.wrong + 1, streak: 0 }
      : kind === 'first-try'
        ? { wrong: current.wrong, streak: current.streak + 1 }
        : { wrong: current.wrong, streak: 0 };
  return { ...stats, [city]: next };
}

/**
 * Lastige steden: ooit fout gegaan en nog niet twee keer achter elkaar in één
 * keer goed. Meeste fouten eerst.
 */
export function hardCities(stats: CityStats, known: string[]): string[] {
  return known
    .filter((city) => {
      const stat = stats[city];
      return stat !== undefined && stat.wrong > 0 && stat.streak < MASTERED_STREAK;
    })
    .sort((a, b) => stats[b].wrong - stats[a].wrong || a.localeCompare(b));
}

/**
 * Sterren voor een afgerond pakket: 3 = foutloos, 2 = hooguit 1 fout per 10
 * steden, anders 1.
 */
export function starsFor(totalMistakes: number, cityCount: number): 1 | 2 | 3 {
  if (totalMistakes === 0) return 3;
  if (totalMistakes <= Math.max(1, Math.floor(cityCount / 10))) return 2;
  return 1;
}
