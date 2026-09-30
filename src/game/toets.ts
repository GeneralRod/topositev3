// Oefentoets: er knippert een plek, het kind schrijft de naam op. De toets gaat in
// delen (deel 1 = pakket 1, deel 2 = pakket 2, ...), net als de echte toets. Pure
// functies, getest in toets.test.ts.
//
// Nakijken (wens eigenaar): het is een topotoets, geen spellingtoets. Een naam telt
// als goed zodra duidelijk is welke plek het kind bedoelt, ook als die heel anders
// geschreven is. Alleen als de naam meer lijkt op een andere plek (of op niets), is
// hij fout.

import type { Random } from './rules';

export type ToetsLength = 'kort' | 'normaal' | 'alles';

export const TOETS_LENGTHS: Record<ToetsLength, { label: string; share: number; min: number }> = {
  kort: { label: 'Kort', share: 0.25, min: 3 },
  normaal: { label: 'Normaal', share: 0.5, min: 5 },
  alles: { label: 'Alles', share: 1, min: 0 },
};

/** Munten per goed antwoord (net als bij aanwijzen, zonder snelheidsbonus). */
export const TOETS_COINS_PER_CORRECT = 5;

/** Aantal vragen uit een pakket van deze grootte. */
export function questionCount(size: number, length: ToetsLength): number {
  const { share, min } = TOETS_LENGTHS[length];
  return Math.min(size, Math.max(min, Math.round(size * share)));
}

function shuffle<T>(items: T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface ToetsQuestion {
  /** Deel van de toets (0 = deel 1). */
  part: number;
  name: string;
}

/** De vragen: per deel een willekeurige keuze uit dat pakket, in willekeurige volgorde. */
export function planToets(
  parts: string[][],
  length: ToetsLength,
  random: Random = Math.random,
): ToetsQuestion[] {
  return parts.flatMap((names, part) =>
    shuffle(names, random)
      .slice(0, questionCount(names.length, length))
      .map((name) => ({ part, name })),
  );
}

/** Cijfer (wens eigenaar): goed / totaal × 10, op één decimaal. */
export function toetsGrade(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100) / 10;
}

/** Cijfer zoals op school: 8,5 (met komma). */
export function formatGrade(grade: number): string {
  return grade.toFixed(1).replace('.', ',');
}

/** Sleutel voor het beste cijfer, bijv. 'landen:2:normaal'. */
export function toetsKey(categoryId: string, upto: number, length: ToetsLength): string {
  return `${categoryId}:${upto}:${length}`;
}

/** "Toets pakket 1 + 2 + 3" */
export function toetsTitle(upto: number): string {
  return `Toets pakket ${Array.from({ length: upto }, (_, i) => i + 1).join(' + ')}`;
}

// ---------- nakijken ----------

/** Kleine letters, zonder accenten, leestekens en spaties: "Italië" → "italie". */
export function plainName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Hoe een naam klinkt, grof: letters die kinderen vaak door elkaar halen worden
 * gelijk ("Madagaskar" = "Madagascar", "Kazagstan" = "Kazachstan").
 */
export function soundKey(text: string): string {
  return plainName(text)
    .replace(/ph/g, 'f')
    .replace(/sch/g, 's')
    .replace(/ch/g, 'g')
    .replace(/c(?=[eiy])/g, 's')
    .replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks')
    .replace(/z/g, 's')
    .replace(/v/g, 'f')
    .replace(/w/g, 'f')
    .replace(/(ij|ei|y)/g, 'i')
    .replace(/ie/g, 'i')
    .replace(/oe/g, 'u')
    .replace(/(ou|au)/g, 'o')
    .replace(/dt\b|d$/g, 't')
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1');
}

/** Aantal letters verschil (invoegen, weglaten, vervangen of twee omdraaien). */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[rows - 1][cols - 1];
}

/**
 * Woorden die in veel namen staan; zonder die woorden is een naam vaak ook
 * duidelijk ("Atlantische" voor "Atlantische Oceaan").
 */
const GENERIC_WORDS = new Set([
  'de',
  'het',
  'van',
  'zee',
  'oceaan',
  'meer',
  'rivier',
  'gebergte',
  'woestijn',
  'trog',
  'golf',
  'baai',
  'straat',
  'kanaal',
  'provincie',
]);

/** Korte vorm van een naam zonder algemene woorden, of null als die er niet is. */
function shortForm(name: string): string | null {
  const words = name
    .replace(/\(.*?\)/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);
  const kept = words.filter((w) => !GENERIC_WORDS.has(plainName(w)));
  if (kept.length === 0 || kept.length === words.length) return null;
  return kept.join(' ');
}

export interface Candidate {
  /** De plek (het goede antwoord als dit gevraagd wordt). */
  name: string;
  /** Alle schrijfwijzen die bij deze plek horen. */
  forms: string[];
}

/**
 * Alle plekken waartussen gekozen wordt bij het nakijken: de plekken van het
 * onderwerp met hun andere namen, plus namen die erop lijken maar er niet in staan
 * (bijv. Niger naast Nigeria), zodat die niet per ongeluk goed rekenen.
 */
export function makeCandidates(
  names: string[],
  aliases: Record<string, string[]> = {},
  lookalikes: string[] = [],
): Candidate[] {
  const own = names.map((name) => {
    const short = shortForm(name);
    return {
      name,
      forms: [name, ...(aliases[name] ?? []), ...(short ? [short] : [])],
    };
  });
  const known = new Set(names.map(plainName));
  const others = lookalikes
    .filter((name) => !known.has(plainName(name)))
    .map((name) => ({ name: `~${name}`, forms: [name] }));
  return [...own, ...others];
}

export interface Judgement {
  correct: boolean;
  /** Precies goed geschreven (hoofdletters, accenten en streepjes tellen niet). */
  exact: boolean;
}

/** Hoe ver een antwoord van een plek af zit: 0 = gelijk, 1 = niets gemeen. */
function closeness(typed: string, candidate: Candidate): number {
  const key = soundKey(typed);
  return Math.min(
    ...candidate.forms.map((form) => {
      const target = soundKey(form);
      return editDistance(key, target) / Math.max(target.length, key.length, 1);
    }),
  );
}

/** Tot hoe ver een antwoord er nog naast mag zitten (coulant, wens eigenaar). */
const MAX_DISTANCE = 0.5;

export function judgeAnswer(typed: string, answer: string, candidates: Candidate[]): Judgement {
  const plain = plainName(typed);
  if (plain.length === 0) return { correct: false, exact: false };
  const own = candidates.find((c) => c.name === answer) ?? { name: answer, forms: [answer] };
  if (own.forms.some((form) => plainName(form) === plain)) return { correct: true, exact: true };
  // Precies een andere plek opgeschreven: fout, hoe dicht die naam ook bij ligt.
  if (candidates.some((c) => c.name !== answer && c.forms.some((f) => plainName(f) === plain))) {
    return { correct: false, exact: false };
  }
  const mine = closeness(typed, own);
  const nearestOther = Math.min(
    ...candidates.filter((c) => c.name !== answer).map((c) => closeness(typed, c)),
  );
  return { correct: mine <= MAX_DISTANCE && mine < nearestOther, exact: false };
}
