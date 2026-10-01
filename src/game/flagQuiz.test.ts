import { describe, expect, it } from 'vitest';
import { flagChoices, flagQuizKey, flagResult, judgeFlag, planFlagQuiz } from './flagQuiz';
import { makeCandidates } from './toets';
import { ALIASES, LOOKALIKES } from '../content/aliases';
import places from '../data/vlaggen/places.json';

const names = places.map((p) => p.name);
const candidates = makeCandidates(names, ALIASES, LOOKALIKES);

describe('vlaggenquiz', () => {
  it('vraagt elke vlag precies één keer', () => {
    const plan = planFlagQuiz(['Nederland', 'België', 'Duitsland'], () => 0.5);
    expect([...plan].sort()).toEqual(['België', 'Duitsland', 'Nederland']);
  });

  it('geeft vier landen uit hetzelfde werelddeel, met het goede erbij', () => {
    const europa = places.filter((p) => p.package === 'vlaggen-europa').map((p) => p.name);
    const choices = flagChoices('Nederland', europa, names, () => 0.3);
    expect(choices).toHaveLength(4);
    expect(choices).toContain('Nederland');
    for (const c of choices) expect(europa).toContain(c);
  });

  it('pakt andere landen als het pakket te klein is', () => {
    const choices = flagChoices('Nederland', ['Nederland', 'België'], names, () => 0.3);
    expect(choices).toHaveLength(4);
    expect(choices).toContain('Nederland');
  });

  it('kijkt meerkeuze precies na', () => {
    expect(judgeFlag('choice', 'Nederland', 'Nederland', candidates).correct).toBe(true);
    expect(judgeFlag('choice', 'Nederland', 'Luxemburg', candidates).correct).toBe(false);
  });

  it('kijkt typen soepel na, maar een ander land is fout', () => {
    expect(judgeFlag('type', 'Nederland', 'nederland', candidates)).toMatchObject({
      correct: true,
      exact: true,
    });
    expect(judgeFlag('type', 'Nederland', 'Holland', candidates).correct).toBe(true);
    expect(judgeFlag('type', 'Kirgizië', 'Kirgizie', candidates).correct).toBe(true);
    expect(judgeFlag('type', 'Soedan', 'Sudan', candidates).correct).toBe(true);
    expect(judgeFlag('type', 'Niger', 'Nigeria', candidates).correct).toBe(false);
    expect(judgeFlag('type', 'Oostenrijk', 'Australië', candidates).correct).toBe(false);
    expect(judgeFlag('type', 'Nederland', '', candidates).correct).toBe(false);
  });

  it('geeft een cijfer, en bij typen meer munten dan bij meerkeuze', () => {
    const answers = [
      judgeFlag('choice', 'Nederland', 'Nederland', candidates),
      judgeFlag('choice', 'België', 'Frankrijk', candidates),
    ];
    expect(flagResult('choice', answers)).toEqual({ correct: 1, total: 2, grade: 5, coins: 3 });
    expect(flagResult('type', answers).coins).toBe(5);
  });

  it('bewaart het beste cijfer per pakket en speelmanier', () => {
    expect(flagQuizKey('vlaggen-europa', 'type')).toBe('vlaggen:vlaggen-europa:type');
  });
});

describe('vlaggen: gegevens', () => {
  it('heeft 195 landen, elk met een eigen vlag, verdeeld over zes werelddelen', () => {
    expect(places).toHaveLength(195);
    expect(new Set(names).size).toBe(195);
    expect(new Set(places.map((p) => p.code)).size).toBe(195);
    const counts = [46, 54, 46, 23, 12, 14];
    [
      'vlaggen-europa',
      'vlaggen-afrika',
      'vlaggen-azie',
      'vlaggen-noord-amerika',
      'vlaggen-zuid-amerika',
      'vlaggen-oceanie',
    ].forEach((id, i) => {
      expect(
        places.filter((p) => p.package === id),
        id,
      ).toHaveLength(counts[i]);
    });
  });
});
