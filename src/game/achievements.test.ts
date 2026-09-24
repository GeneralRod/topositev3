import { describe, expect, it } from 'vitest';
import { achievements, newAchievements, type AchievementFacts } from './achievements';

const nothing: AchievementFacts = { stars: {}, dailyStreak: 0 };

function earnedIds(facts: AchievementFacts, owned: string[] = []): string[] {
  return newAchievements(facts, owned);
}

describe('prestatieprijzen', () => {
  it('heeft unieke id’s (dat zijn de sleutels in de opslag)', () => {
    const ids = achievements.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('geeft niets aan een nieuwe speler', () => {
    expect(earnedIds(nothing)).toEqual([]);
  });

  it('geeft "Eerste pakket" na een afgemaakt pakket, ook met meerkeuze', () => {
    expect(
      earnedIds({ ...nothing, finished: { kind: 'package', mode: 'choice', mistakes: 4 } }),
    ).toEqual(['first-game']);
  });

  it('geeft "Eerste pakket" ook aan wie al sterren had (van vóór het prestatiebord)', () => {
    expect(earnedIds({ ...nothing, stars: { pakket2: 1 } })).toEqual(['first-game']);
  });

  it('telt de dagelijkse uitdaging en het oefenrondje niet als pakket', () => {
    expect(
      earnedIds({ ...nothing, finished: { kind: 'daily', mode: 'map', mistakes: 0 } }),
    ).toEqual([]);
    expect(
      earnedIds({ ...nothing, finished: { kind: 'practice', mode: 'map', mistakes: 3 } }),
    ).toEqual(['practice']);
  });

  it('geeft "Foutloos" bij 3 sterren en "Sterrenregen" bij drie pakketten met 3 sterren', () => {
    expect(earnedIds({ ...nothing, stars: { pakket1: 3 } })).toContain('flawless');
    const twoPerfect = earnedIds({ ...nothing, stars: { pakket1: 3, pakket2: 3, pakket3: 2 } });
    expect(twoPerfect).not.toContain('all-stars');
    const threePerfect = earnedIds({
      ...nothing,
      stars: { pakket1: 3, pakket2: 3, 'pakket1-2': 3 },
    });
    expect(threePerfect).toContain('all-stars');
  });

  it('geeft "Quizmeester" alleen voor meerkeuze zonder fouten', () => {
    const perfectChoice = { kind: 'package', mode: 'choice', mistakes: 0 } as const;
    expect(earnedIds({ ...nothing, finished: perfectChoice })).toContain('quiz-master');
    expect(earnedIds({ ...nothing, finished: { ...perfectChoice, mistakes: 1 } })).not.toContain(
      'quiz-master',
    );
    expect(earnedIds({ ...nothing, finished: { ...perfectChoice, mode: 'map' } })).not.toContain(
      'quiz-master',
    );
  });

  it('geeft reeksprijzen bij 3 en 7 dagen op rij', () => {
    expect(earnedIds({ ...nothing, dailyStreak: 2 })).toEqual([]);
    expect(earnedIds({ ...nothing, dailyStreak: 3 })).toEqual(['streak-3']);
    expect(earnedIds({ ...nothing, dailyStreak: 7 })).toEqual(['streak-3', 'streak-7']);
  });

  it('geeft "Wereldreiziger" voor pakket 1 + 2 + 3', () => {
    expect(earnedIds({ ...nothing, stars: { 'pakket1-2-3': 1 } })).toContain('world-tour');
  });

  it('geeft een prestatie maar één keer', () => {
    expect(earnedIds({ ...nothing, stars: { pakket1: 3 } }, ['first-game', 'flawless'])).toEqual(
      [],
    );
  });
});
