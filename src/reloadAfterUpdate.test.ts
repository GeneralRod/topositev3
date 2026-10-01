import { describe, expect, it, vi } from 'vitest';
import { reloadOnce } from './reloadAfterUpdate';

function deps(stored: string | null, now = 1_000_000) {
  let value = stored;
  return {
    now: () => now,
    load: () => value,
    save: (v: string) => void (value = v),
    reload: vi.fn(),
    stored: () => value,
  };
}

describe('herladen na een nieuwe versie', () => {
  it('laadt de pagina één keer opnieuw', () => {
    const d = deps(null);
    expect(reloadOnce(d)).toBe(true);
    expect(d.reload).toHaveBeenCalledTimes(1);
    expect(d.stored()).toBe('1000000');
  });

  it('blijft niet herladen als het net al gebeurd is', () => {
    const d = deps('990000');
    expect(reloadOnce(d)).toBe(false);
    expect(d.reload).not.toHaveBeenCalled();
  });

  it('mag later wel weer (bij een volgende update)', () => {
    const d = deps('900000');
    expect(reloadOnce(d)).toBe(true);
  });
});
