// Regels van de prijzenkast, los van het scherm (getest in rules.test.ts).

import type { CabinetItem } from './catalog';

export type SlotState =
  { kind: 'owned' } | { kind: 'affordable' } | { kind: 'locked'; coinsNeeded: number };

export function slotState(item: CabinetItem, owned: string[], coins: number): SlotState {
  if (owned.includes(item.id)) return { kind: 'owned' };
  if (coins >= item.price) return { kind: 'affordable' };
  return { kind: 'locked', coinsNeeded: item.price - coins };
}

/** De goedkoopste prijs die je nog niet hebt: een mooi volgend doel. */
export function nextGoal(items: CabinetItem[], owned: string[]): CabinetItem | null {
  const open = items.filter((item) => !owned.includes(item.id));
  if (open.length === 0) return null;
  return open.reduce((cheapest, item) => (item.price < cheapest.price ? item : cheapest));
}
