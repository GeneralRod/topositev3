// Omzetting van de oude prijzenkast (linten en 'echte' prijzen) naar de nieuwe.
// Deze lijsten beschrijven wat er vroeger te koop was en veranderen dus nooit meer.

/** Oude prijzen die in de nieuwe kast terugkomen (zelfde id). */
export const KEPT_PRIZE_IDS = [
  'mini-trophy',
  'silver-trophy',
  'gold-trophy',
  'cup',
  'medal',
  'compass',
  'binoculars',
  'camera',
  'ship',
  'book',
  'atlas',
  'map',
  'globe',
  'mountain',
] as const;

/** Wat oude spullen die verdwijnen hebben gekost; dat krijgt de speler terug. */
export const LEGACY_REFUND_PRICES: Record<string, number> = {
  'ribbon-red': 100,
  'ribbon-blue': 120,
  'ribbon-gold': 200,
  'door-sticker': 150,
  'door-ribbon': 180,
};

/** Maximaal aantal linten per soort in de oude kast. */
const MAX_RIBBONS = 5;

export function upgradeCollection(
  realPrizes: string[],
  ribbons: Record<string, number>,
): { prizes: string[]; refund: number } {
  const kept = new Set<string>(KEPT_PRIZE_IDS);
  const prizes = realPrizes.filter((id) => kept.has(id));
  let refund = 0;
  for (const id of new Set(realPrizes)) {
    if (!kept.has(id)) refund += LEGACY_REFUND_PRICES[id] ?? 0;
  }
  for (const [id, count] of Object.entries(ribbons)) {
    refund += (LEGACY_REFUND_PRICES[id] ?? 0) * Math.min(count, MAX_RIBBONS);
  }
  return { prizes: Array.from(new Set(prizes)), refund };
}
