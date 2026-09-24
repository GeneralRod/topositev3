import { describe, expect, it } from 'vitest';
import { categories, findCategory, findPackage, locationsFor } from './catalog';

describe('catalogus', () => {
  const capitals = findCategory('capitals')!;

  it('vindt pakketten en hun steden', () => {
    const found = findPackage(capitals, 'pakket1-2')!;
    expect(found.kind).toBe('game');
    const names = locationsFor(capitals, found.pkg).map((c) => c.package);
    expect(new Set(names)).toEqual(new Set(['pakket1', 'pakket2']));
  });

  it('heeft steden in elk pakket', () => {
    for (const category of categories) {
      for (const section of category.sections) {
        for (const pkg of section.packages) {
          expect(locationsFor(category, pkg).length, pkg.id).toBeGreaterThan(0);
        }
      }
    }
  });

  it("heeft unieke pakket-id's en stadsnamen (die zijn de sleutels van de voortgang)", () => {
    for (const category of categories) {
      const ids = category.sections.flatMap((s) => s.packages.map((p) => p.id));
      expect(new Set(ids).size).toBe(ids.length);
      const names = category.locations.map((l) => l.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('geeft undefined voor onbekende pakketten', () => {
    expect(findCategory('bestaatniet')).toBeUndefined();
    expect(findPackage(capitals, 'pakket9')).toBeUndefined();
  });
});
