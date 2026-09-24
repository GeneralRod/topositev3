import { describe, expect, it } from 'vitest';
import { allPrizes, DEFAULT_FINISH, extras, finishes, shelves, stickers } from './catalog';
import { effectiveStyle, nextGoal, slotState } from './rules';
import { KEPT_PRIZE_IDS } from '../storage/migrations';
import { achievements } from '../game/achievements';

describe('catalogus van de prijzenkast', () => {
  it('heeft 5 planken met elk 4 prijzen', () => {
    expect(shelves).toHaveLength(5);
    for (const shelf of shelves) expect(shelf.items).toHaveLength(4);
  });

  it('heeft unieke id’s (dat zijn de sleutels in de opslag)', () => {
    const ids = [...allPrizes, ...stickers, ...finishes, ...extras, ...achievements].map(
      (item) => item.id,
    );
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

describe('kast opknappen', () => {
  const finishIds = finishes.map((f) => f.id);
  const style = (finish: string, extraIds: string[] = []) => ({ finish, extras: extraIds });

  it('eikenhout is gratis en altijd beschikbaar', () => {
    expect(finishes.find((f) => f.id === DEFAULT_FINISH)?.price).toBe(0);
    expect(effectiveStyle(style('oak'), [], finishIds, DEFAULT_FINISH).finish).toBe('oak');
  });

  it('toont alleen gekochte kleuren en extra’s', () => {
    const shown = effectiveStyle(
      style('pink', ['lights', 'sparkles']),
      ['lights'],
      finishIds,
      DEFAULT_FINISH,
    );
    expect(shown).toEqual({ finish: 'oak', extras: ['lights'] });
  });

  it('toont een gekochte kleur', () => {
    expect(effectiveStyle(style('pink'), ['pink'], finishIds, DEFAULT_FINISH).finish).toBe('pink');
  });

  it('valt terug op eikenhout bij een onbekende kleur', () => {
    expect(effectiveStyle(style('paars'), ['paars'], finishIds, DEFAULT_FINISH).finish).toBe('oak');
  });
});
