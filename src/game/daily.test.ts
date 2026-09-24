import { describe, expect, it } from 'vitest';
import {
  completeDaily,
  currentStreak,
  dailyBonus,
  dailyCities,
  dateKey,
  doneToday,
  type DailyRecord,
} from './daily';

const NAMES = Array.from({ length: 30 }, (_, i) => `Stad ${i}`);
const fresh: DailyRecord = { lastCompleted: null, streak: 0 };

describe('dagelijkse uitdaging', () => {
  it('schrijft de datum als JJJJ-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('geeft elke dag 10 vaste steden', () => {
    const a = dailyCities(NAMES, '2026-09-24', 'capitals');
    expect(a).toHaveLength(10);
    expect(new Set(a).size).toBe(10);
    expect(dailyCities(NAMES, '2026-09-24', 'capitals')).toEqual(a);
    expect(dailyCities(NAMES, '2026-09-25', 'capitals')).not.toEqual(a);
  });

  it('neemt alle steden als er minder dan 10 zijn', () => {
    expect(dailyCities(['A', 'B'], '2026-09-24', 'x').sort()).toEqual(['A', 'B']);
  });

  it('bouwt een reeks op bij dagen achter elkaar', () => {
    let r = completeDaily(fresh, '2026-09-24');
    expect(r).toEqual({ lastCompleted: '2026-09-24', streak: 1 });
    r = completeDaily(r, '2026-09-25');
    expect(r.streak).toBe(2);
    expect(doneToday(r, '2026-09-25')).toBe(true);
  });

  it('telt dezelfde dag maar één keer', () => {
    const r = completeDaily(fresh, '2026-09-24');
    expect(completeDaily(r, '2026-09-24')).toBe(r);
  });

  it('begint opnieuw na een gemiste dag', () => {
    const r = completeDaily({ lastCompleted: '2026-09-20', streak: 5 }, '2026-09-24');
    expect(r.streak).toBe(1);
    expect(currentStreak({ lastCompleted: '2026-09-20', streak: 5 }, '2026-09-24')).toBe(0);
  });

  it('werkt over de maandgrens heen', () => {
    const r = completeDaily({ lastCompleted: '2026-09-30', streak: 3 }, '2026-10-01');
    expect(r.streak).toBe(4);
  });

  it('geeft meer bonus bij een langere reeks, tot een maximum', () => {
    expect(dailyBonus(1)).toBe(50);
    expect(dailyBonus(3)).toBe(70);
    expect(dailyBonus(30)).toBe(120);
  });
});
