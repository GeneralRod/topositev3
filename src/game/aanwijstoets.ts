// Aanwijstoets: een speelmanier bij de pakketten (wens eigenaar). De naam staat in
// beeld en je klikt de plek één keer aan; elke plek komt één keer. Pas aan het
// eind zie je wat goed was, met een cijfer (zelfde berekening als de oefentoets).
// Pure functies, getest in aanwijstoets.test.ts.

import type { Random } from './rules';
import { planToets, toetsGrade, TOETS_COINS_PER_CORRECT } from './toets';

export interface AanwijsAnswer {
  /** De gevraagde plek. */
  name: string;
  /** De plek die aangeklikt is, of '' bij "Weet ik niet". */
  clicked: string;
  correct: boolean;
}

/** Alle plekken van het pakket, elk één keer, in willekeurige volgorde. */
export function planAanwijstoets(names: string[], random: Random = Math.random): string[] {
  return planToets([names], 'alles', random).map((q) => q.name);
}

export function judgeClick(name: string, clicked: string): AanwijsAnswer {
  return { name, clicked, correct: clicked === name };
}

export interface AanwijsResult {
  correct: number;
  total: number;
  grade: number;
  coins: number;
}

export function aanwijsResult(answers: AanwijsAnswer[]): AanwijsResult {
  const correct = answers.filter((a) => a.correct).length;
  return {
    correct,
    total: answers.length,
    grade: toetsGrade(correct, answers.length),
    coins: correct * TOETS_COINS_PER_CORRECT,
  };
}

/** Sleutel voor het beste cijfer (bij de cijfers van de oefentoets bewaard). */
export function aanwijstoetsKey(packageId: string): string {
  return `aanwijstoets:${packageId}`;
}
