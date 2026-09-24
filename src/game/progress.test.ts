import { describe, expect, it } from 'vitest';
import { hardCities, recordAnswer, starsFor, type CityStats } from './progress';

describe('lastige steden', () => {
  it('telt fouten bij de gevraagde stad', () => {
    let stats: CityStats = {};
    stats = recordAnswer(stats, 'Lima', 'wrong');
    stats = recordAnswer(stats, 'Lima', 'wrong');
    expect(stats.Lima).toEqual({ wrong: 2, streak: 0 });
    expect(hardCities(stats, ['Lima', 'Rome'])).toEqual(['Lima']);
  });

  it('een stad is niet meer lastig na twee keer achter elkaar in één keer goed', () => {
    let stats: CityStats = recordAnswer({}, 'Lima', 'wrong');
    stats = recordAnswer(stats, 'Lima', 'first-try');
    expect(hardCities(stats, ['Lima'])).toEqual(['Lima']);
    stats = recordAnswer(stats, 'Lima', 'first-try');
    expect(hardCities(stats, ['Lima'])).toEqual([]);
  });

  it('goed na een fout telt niet als in één keer goed', () => {
    let stats: CityStats = recordAnswer({}, 'Lima', 'wrong');
    stats = recordAnswer(stats, 'Lima', 'first-try');
    stats = recordAnswer(stats, 'Lima', 'after-mistake');
    expect(stats.Lima.streak).toBe(0);
  });

  it('steden die je altijd goed had zijn niet lastig', () => {
    const stats = recordAnswer({}, 'Rome', 'first-try');
    expect(hardCities(stats, ['Rome'])).toEqual([]);
  });

  it('zet de stad met de meeste fouten bovenaan en negeert onbekende steden', () => {
    let stats: CityStats = {};
    stats = recordAnswer(stats, 'Lima', 'wrong');
    stats = recordAnswer(stats, 'Kinshasa', 'wrong');
    stats = recordAnswer(stats, 'Kinshasa', 'wrong');
    stats = recordAnswer(stats, 'Atlantis', 'wrong');
    expect(hardCities(stats, ['Lima', 'Kinshasa'])).toEqual(['Kinshasa', 'Lima']);
  });
});

describe('sterren', () => {
  it('3 sterren voor foutloos', () => {
    expect(starsFor(0, 50)).toBe(3);
  });

  it('2 sterren bij hooguit 1 fout per 10 steden', () => {
    expect(starsFor(5, 50)).toBe(2);
    expect(starsFor(1, 10)).toBe(2);
    expect(starsFor(1, 5)).toBe(2);
  });

  it('1 ster bij meer fouten', () => {
    expect(starsFor(6, 50)).toBe(1);
    expect(starsFor(2, 10)).toBe(1);
  });
});
