import { describe, expect, it } from 'vitest';
import { allPrizes, shelves, stickers } from './catalog';
import { nextGoal, slotState } from './rules';
import { KEPT_PRIZE_IDS } from '../storage/migrations';

describe('catalogus van de prijzenkast', () => {
  it('heeft 4 planken met elk 4 prijzen', () => {
    expect(shelves).toHaveLength(4);
    for (const shelf of shelves) expect(shelf.items).toHaveLength(4);
  });

  it('heeft unieke id’s (dat zijn de sleutels in de opslag)', () => {
    const ids = [...allPrizes, ...stickers].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('bevat alle oude prijzen die spelers al kunnen hebben', () => {
    const ids = allPrizes.map((item) => item.id);
    for (const id of KEPT_PRIZE_IDS) expect(ids).toContain(id);
  });

  it('heeft per plank oplopende prijzen', () => {
    for (const shelf of shelves) {
      const prices = shelf.items.map((item) => item.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    }
  });
});

describe('plekken in de kast', () => {
  const globe = allPrizes.find((item) => item.id === 'globe')!;

  it('toont gekochte prijzen als bezit', () => {
    expect(slotState(globe, ['globe'], 0)).toEqual({ kind: 'owned' });
  });

  it('laat zien of je een prijs kunt kopen', () => {
    expect(slotState(globe, [], globe.price)).toEqual({ kind: 'affordable' });
  });

  it('zegt hoeveel munten je nog nodig hebt', () => {
    expect(slotState(globe, [], globe.price - 120)).toEqual({ kind: 'locked', coinsNeeded: 120 });
  });

  it('kiest de goedkoopste prijs die je nog niet hebt als doel', () => {
    expect(nextGoal(allPrizes, [])?.id).toBe('compass');
    expect(nextGoal(allPrizes, ['compass'])?.id).toBe('book');
    expect(
      nextGoal(
        allPrizes,
        allPrizes.map((item) => item.id),
      ),
    ).toBeNull();
  });
});
