// Versienummer van de site: X.Y, bij elke build vanzelf bepaald (vite.config.ts).
//
// X (groot nummer) verandert alleen bij een mijlpaal die de site voor iedereen
// echt anders maakt. Dat beslist Claude (zie CLAUDE.md). Tot nu toe:
//   1  de eerste site
//   2  de herbouw (fase 1 t/m 3)
//   3  de grote uitbreiding (kaart, sterren, meerkeuze, dagelijkse uitdaging, onderwerpen)
//   4  accounts (pull request #115, 1 oktober 2026)
//   5  waarschijnlijk klassen en leraren, of een heel nieuw ontwerp
//
// Y telt vanzelf op: elke pull request in main ná de mijlpaal die de site zelf
// verandert (niet alleen documentatie, zoals PLAN.md) is één update.
//
// Nieuw groot nummer: MAJOR één hoger en MAJOR_PR = het nummer van de pull
// request die de mijlpaal is (die telt als X.0).

export const MAJOR = 4;
export const MAJOR_PR = 115;

/** Telt een samengevoegde pull request mee? Niet als hij alleen documentatie aanpast. */
export function isSiteUpdate(changedFiles: string[]): boolean {
  return changedFiles.some((file) => file.trim() !== '' && !file.endsWith('.md'));
}

/**
 * Tekst voor op de site, bijv. "Versie 4.5". updates = null als de
 * geschiedenis niet te lezen is; dan alleen het grote nummer.
 */
export function versionLabel(updates: number | null): string {
  return updates === null ? `Versie ${MAJOR}` : `Versie ${MAJOR}.${updates}`;
}
