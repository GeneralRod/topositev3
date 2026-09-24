// Dagelijkse uitdaging: elke dag dezelfde 10 steden voor iedereen, en een
// reeks (streak) als je meerdere dagen achter elkaar meedoet. Pure functies,
// getest in daily.test.ts.

import { pickChoices, seededRandom } from './choices';

export const DAILY_SIZE = 10;
/** Extra munten: basis + per dag in je reeks, tot een maximum. */
export const DAILY_BASE_BONUS = 50;
export const DAILY_STREAK_BONUS = 10;
export const DAILY_MAX_BONUS = 120;

export interface DailyRecord {
  /** Laatste dag (JJJJ-MM-DD) dat je de uitdaging afmaakte. */
  lastCompleted: string | null;
  /** Aantal dagen achter elkaar. */
  streak: number;
}

/** Datum als JJJJ-MM-DD in de tijdzone van de computer. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

/** De steden van vandaag: vast per dag en onderwerp. */
export function dailyCities(names: string[], day: string, categoryId: string): string[] {
  if (names.length <= DAILY_SIZE) return [...names];
  const random = seededRandom(`${categoryId}:${day}`);
  // pickChoices schudt en neemt een deel; de eerste naam is een willekeurige start.
  const start = names[Math.floor(random() * names.length)];
  return pickChoices(start, names, random, DAILY_SIZE);
}

export function doneToday(record: DailyRecord, today: string): boolean {
  return record.lastCompleted === today;
}

/** Reeks die je nu hebt: telt alleen als je gisteren of vandaag meedeed. */
export function currentStreak(record: DailyRecord, today: string): number {
  if (record.lastCompleted === today || record.lastCompleted === previousDay(today)) {
    return record.streak;
  }
  return 0;
}

/** Nieuwe stand na het afmaken van de uitdaging van vandaag. */
export function completeDaily(record: DailyRecord, today: string): DailyRecord {
  if (doneToday(record, today)) return record;
  const continues = record.lastCompleted === previousDay(today);
  return { lastCompleted: today, streak: continues ? record.streak + 1 : 1 };
}

export function dailyBonus(streak: number): number {
  return Math.min(DAILY_MAX_BONUS, DAILY_BASE_BONUS + DAILY_STREAK_BONUS * (streak - 1));
}
