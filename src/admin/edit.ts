// Voortgang van een speler aanpassen op de beheerpagina. Pure functies, getest
// in edit.test.ts.

import type { SaveData } from '../storage';
import { allPrizes, extras, finishes, stickers } from '../cabinet/catalog';
import { achievements } from '../game/achievements';
import { categories } from '../content/catalog';

export type ListField = 'prizes' | 'stickers' | 'upgrades' | 'achievements';

export function setCoins(data: SaveData, coins: number): SaveData {
  return { ...data, coins: Math.max(0, Math.floor(Number.isFinite(coins) ? coins : 0)) };
}

export function toggleItem(data: SaveData, field: ListField, id: string): SaveData {
  const list = data[field];
  return {
    ...data,
    [field]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id],
  };
}

/** 0 sterren = geen sterren voor dat pakket. */
export function setStars(data: SaveData, packageId: string, count: number): SaveData {
  const stars = { ...data.stars };
  if (count <= 0) delete stars[packageId];
  else stars[packageId] = Math.min(3, Math.floor(count));
  return { ...data, stars };
}

/** Pakketten waarvoor je sterren kunt halen, per onderwerp. */
export function starPackages(): { category: string; packages: { id: string; title: string }[] }[] {
  return categories.map((category) => ({
    category: category.title,
    packages: category.sections
      .filter((section) => section.kind === 'game')
      .flatMap((section) => section.packages.map(({ id, title }) => ({ id, title }))),
  }));
}

const NAMES: Record<ListField, Map<string, string>> = {
  prizes: new Map(allPrizes.map((item) => [item.id, item.name])),
  stickers: new Map(stickers.map((item) => [item.id, item.name])),
  upgrades: new Map([...finishes, ...extras].map((item) => [item.id, item.name])),
  achievements: new Map(achievements.map((item) => [item.id, item.name])),
};

const LABELS: Record<ListField, string> = {
  prizes: 'Prijs',
  stickers: 'Sticker',
  upgrades: 'Kast-upgrade',
  achievements: 'Prestatie',
};

export function itemName(field: ListField, id: string): string {
  return NAMES[field].get(id) ?? id;
}

function packageTitle(id: string): string {
  for (const { category, packages } of starPackages()) {
    const pkg = packages.find((p) => p.id === id);
    if (pkg) return `${category}: ${pkg.title}`;
  }
  return id;
}

/** Wat er verandert, in gewone taal (voor de knop Opslaan en het logboek). */
export function describeChanges(before: SaveData | null, after: SaveData | null): string[] {
  if (!before || !after) return [];
  const lines: string[] = [];
  if (before.coins !== after.coins) {
    const diff = after.coins - before.coins;
    lines.push(`Munten: ${before.coins} → ${after.coins} (${diff > 0 ? '+' : ''}${diff})`);
  }
  for (const field of Object.keys(LABELS) as ListField[]) {
    for (const id of after[field].filter((item) => !before[field].includes(item))) {
      lines.push(`${LABELS[field]} erbij: ${itemName(field, id)}`);
    }
    for (const id of before[field].filter((item) => !after[field].includes(item))) {
      lines.push(`${LABELS[field]} weg: ${itemName(field, id)}`);
    }
  }
  for (const id of new Set([...Object.keys(before.stars), ...Object.keys(after.stars)])) {
    const from = before.stars[id] ?? 0;
    const to = after.stars[id] ?? 0;
    if (from !== to) lines.push(`Sterren ${packageTitle(id)}: ${from} → ${to}`);
  }
  return lines;
}
