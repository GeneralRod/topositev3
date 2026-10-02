// Het versienummer van de site wordt bij elke build vanzelf bepaald (zie
// vite.config.ts): elke pull request die in main komt (en dus live gaat) telt
// één op. Groot nummer (9) en beginpunt staan hieronder.

export const MAJOR = 9;
/** Aantal samengevoegde pull requests in main toen versie 9.0 live stond. */
export const BASELINE_MERGES = 52;

/**
 * Tekst voor op de site, bijv. "Versie 9.3 · 2 okt 2026". Zonder git-gegevens
 * (merges = null) alleen de datum.
 */
export function versionLabel(merges: number | null, date: Date): string {
  const day = date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Amsterdam',
  });
  if (merges === null || !Number.isFinite(merges)) return `Versie van ${day}`;
  return `Versie ${MAJOR}.${Math.max(0, merges - BASELINE_MERGES)} · ${day}`;
}
