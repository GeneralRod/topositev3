import { describe, expect, it } from 'vitest';
import { choicePool, hintRemovals, pickChoices, seededRandom } from './choices';

const POOL = ['Parijs', 'Berlijn', 'Rome', 'Madrid', 'Wenen', 'Oslo'];

describe('meerkeuze', () => {
  it('geeft vier verschillende namen, waaronder het goede antwoord', () => {
    for (let seed = 0; seed < 20; seed++) {
      let x = seed / 20;
      const random = () => (x = (x * 9301 + 0.49297) % 1);
      const choices = pickChoices('Rome', POOL, random);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain('Rome');
      for (const name of choices) expect(POOL).toContain(name);
    }
  });

  it('zet het goede antwoord niet altijd op dezelfde plek', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 50; i++) positions.add(pickChoices('Rome', POOL).indexOf('Rome'));
    expect(positions.size).toBeGreaterThan(1);
  });

  it('werkt ook met een klein pakket', () => {
    const choices = pickChoices('Rome', ['Rome', 'Oslo']);
    expect(choices.sort()).toEqual(['Oslo', 'Rome']);
  });

  it('de hint haalt twee foute antwoorden weg, nooit het goede', () => {
    const removed = hintRemovals(['Parijs', 'Rome', 'Oslo', 'Wenen'], 'Rome');
    expect(removed).toHaveLength(2);
    expect(removed).not.toContain('Rome');
  });
});

describe('foute antwoorden van dezelfde soort', () => {
  const places = [
    { name: 'Noordzee', kind: 'sea' },
    { name: 'Rode Zee', kind: 'sea' },
    { name: 'Zwarte Zee', kind: 'sea' },
    { name: 'Bajkalmeer', kind: 'lake' },
    { name: 'Nijl', kind: 'river' },
    { name: 'Rijn', kind: 'river' },
    { name: 'Alpen', kind: 'range' },
  ];

  it('kiest bij water alleen water (zeeën en meren)', () => {
    expect(choicePool('Noordzee', places).sort()).toEqual(
      ['Bajkalmeer', 'Noordzee', 'Rode Zee', 'Zwarte Zee'].sort(),
    );
  });

  it('valt terug op alle plekken als er te weinig van dezelfde soort zijn', () => {
    expect(choicePool('Nijl', places)).toHaveLength(places.length);
  });

  it('behandelt steden (zonder soort) als één groep', () => {
    const cities = POOL.map((name) => ({ name }));
    expect(choicePool('Rome', cities)).toEqual(POOL);
  });
});

describe('vaste antwoorden per vraag', () => {
  it('geeft met dezelfde sleutel dezelfde antwoorden', () => {
    expect(pickChoices('Rome', POOL, seededRandom('Rome#3'))).toEqual(
      pickChoices('Rome', POOL, seededRandom('Rome#3')),
    );
  });

  it('geeft getallen tussen 0 en 1', () => {
    const random = seededRandom('test');
    for (let i = 0; i < 100; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});
