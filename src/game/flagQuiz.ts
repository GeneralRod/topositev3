// Vlaggenquiz (meerkeuze en typen): er staat een vlag in beeld en je zegt welk land
// het is. Elke vlag één keer; je ziet meteen of het goed was. Aan het eind een
// cijfer, net als bij de oefentoets. Aanwijzen op de kaart is het gewone spel (met
// de vlag in plaats van de naam). Pure functies, getest in flagQuiz.test.ts.

import type { Random } from './rules';
import { CHOICE_COUNT, pickChoices } from './choices';
import { judgeAnswer, planToets, toetsGrade, type Candidate } from './toets';

export type FlagQuizMode = 'choice' | 'type';

/** Munten per goed antwoord: meerkeuze is makkelijker, dus minder. */
export const FLAG_COINS: Record<FlagQuizMode, number> = { choice: 3, type: 5 };

/** Alle vlaggen van het pakket, elk één keer, in willekeurige volgorde. */
export function planFlagQuiz(names: string[], random: Random = Math.random): string[] {
  return planToets([names], 'alles', random).map((q) => q.name);
}

/**
 * Vier landen om uit te kiezen: het goede plus drie uit hetzelfde pakket
 * (hetzelfde werelddeel), of uit alle landen als het pakket te klein is.
 */
export function flagChoices(
  answer: string,
  packageNames: string[],
  allNames: string[],
  random: Random = Math.random,
): string[] {
  const pool = packageNames.length >= CHOICE_COUNT ? packageNames : allNames;
  return pickChoices(answer, pool, random);
}

export interface FlagAnswer {
  name: string;
  /** Wat het kind koos of typte ('' bij "Weet ik niet"). */
  given: string;
  correct: boolean;
  /** Precies goed geschreven (alleen bij typen van belang). */
  exact: boolean;
}

export function judgeFlag(
  mode: FlagQuizMode,
  name: string,
  given: string,
  candidates: Candidate[],
): FlagAnswer {
  if (mode === 'choice') {
    const correct = given === name;
    return { name, given, correct, exact: correct };
  }
  return { name, given: given.trim(), ...judgeAnswer(given, name, candidates) };
}

export interface FlagResult {
  correct: number;
  total: number;
  grade: number;
  coins: number;
}

export function flagResult(mode: FlagQuizMode, answers: FlagAnswer[]): FlagResult {
  const correct = answers.filter((a) => a.correct).length;
  return {
    correct,
    total: answers.length,
    grade: toetsGrade(correct, answers.length),
    coins: correct * FLAG_COINS[mode],
  };
}

/** Sleutel voor het beste cijfer (bij de cijfers van de oefentoets bewaard). */
export function flagQuizKey(packageId: string, mode: FlagQuizMode): string {
  return `vlaggen:${packageId}:${mode}`;
}
