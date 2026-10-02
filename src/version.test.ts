import { describe, expect, it } from 'vitest';
import { BASELINE_MERGES, versionLabel } from './version';

const day = new Date('2026-10-02T10:00:00Z');

describe('versienummer', () => {
  it('telt elke pull request sinds versie 9.0', () => {
    expect(versionLabel(BASELINE_MERGES, day)).toMatch(/^Versie 9\.0 · 2 okt\.? 2026$/);
    expect(versionLabel(BASELINE_MERGES + 3, day)).toMatch(/^Versie 9\.3 · /);
  });

  it('toont alleen de datum als git niet beschikbaar is', () => {
    expect(versionLabel(null, day)).toMatch(/^Versie van 2 okt\.? 2026$/);
  });
});
