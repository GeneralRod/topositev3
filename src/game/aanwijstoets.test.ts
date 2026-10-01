import { describe, expect, it } from 'vitest';
import { aanwijsResult, aanwijstoetsKey, judgeClick, planAanwijstoets } from './aanwijstoets';

describe('aanwijstoets', () => {
  it('vraagt elke plek precies één keer', () => {
    const names = ['Parijs', 'Berlijn', 'Madrid', 'Rome', 'Oslo'];
    const plan = planAanwijstoets(names, () => 0.3);
    expect(plan).toHaveLength(5);
    expect([...plan].sort()).toEqual([...names].sort());
  });

  it('is alleen goed als je de gevraagde plek aanklikt', () => {
    expect(judgeClick('Parijs', 'Parijs').correct).toBe(true);
    expect(judgeClick('Parijs', 'Berlijn').correct).toBe(false);
    expect(judgeClick('Parijs', '').correct).toBe(false);
  });

  it('geeft een cijfer en munten zoals de oefentoets', () => {
    const answers = [
      judgeClick('Parijs', 'Parijs'),
      judgeClick('Rome', 'Rome'),
      judgeClick('Oslo', ''),
      judgeClick('Madrid', 'Rome'),
    ];
    expect(aanwijsResult(answers)).toEqual({ correct: 2, total: 4, grade: 5, coins: 10 });
  });

  it('bewaart het cijfer per pakket', () => {
    expect(aanwijstoetsKey('landen1')).toBe('aanwijstoets:landen1');
  });
});
