import { describe, expect, it } from 'vitest';
import { isSiteUpdate, MAJOR, versionLabel } from './version';

describe('versienummer', () => {
  it('telt updates achter de punt', () => {
    expect(versionLabel(0)).toBe(`Versie ${MAJOR}.0`);
    expect(versionLabel(5)).toBe(`Versie ${MAJOR}.5`);
  });

  it('toont alleen het grote nummer als de geschiedenis ontbreekt', () => {
    expect(versionLabel(null)).toBe(`Versie ${MAJOR}`);
  });

  it('telt alleen pull requests die de site zelf veranderen', () => {
    expect(isSiteUpdate(['PLAN.md', 'CLAUDE.md'])).toBe(false);
    expect(isSiteUpdate(['PLAN.md', 'src/App.tsx'])).toBe(true);
    expect(isSiteUpdate([])).toBe(false);
  });
});
