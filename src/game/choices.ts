// Meerkeuze: welke vier namen je te zien krijgt. Pure functies, getest in
// choices.test.ts.

import type { Random } from './rules';

export const CHOICE_COUNT = 4;

function shuffle<T>(items: T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Het goede antwoord plus (maximaal) drie andere namen uit het pakket, in
 * willekeurige volgorde.
 */
export function pickChoices(
  answer: string,
  pool: string[],
  random: Random = Math.random,
  count = CHOICE_COUNT,
): string[] {
  const others = shuffle(
    pool.filter((name) => name !== answer),
    random,
  ).slice(0, count - 1);
  return shuffle([answer, ...others], random);
}

/** Hint bij meerkeuze: twee foute antwoorden vallen weg (of minder als er minder zijn). */
export function hintRemovals(choices: string[], answer: string): string[] {
  return choices.filter((name) => name !== answer).slice(0, 2);
}

/**
 * Voorspelbare 'willekeur' op basis van een tekst: dezelfde vraag geeft steeds
 * dezelfde vier antwoorden (ook als het scherm opnieuw tekent).
 */
export function seededRandom(seed: string): Random {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
