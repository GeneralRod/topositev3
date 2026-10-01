import { describe, expect, it } from 'vitest';
import {
  formatGrade,
  judgeAnswer,
  makeCandidates,
  planToets,
  questionCount,
  toetsGrade,
  toetsKey,
} from './toets';
import { ALIASES, LOOKALIKES } from '../content/aliases';
import places from '../data/landen/places.json';
import waters from '../data/wateren/places.json';
import nederland from '../data/nederland/places.json';

describe('oefentoets: aantal vragen', () => {
  it('neemt 25% (kort), 50% (normaal) of alles, met een minimum', () => {
    expect([50, 40, 15, 10].map((n) => questionCount(n, 'kort'))).toEqual([13, 10, 4, 3]);
    expect([50, 40, 15, 10].map((n) => questionCount(n, 'normaal'))).toEqual([25, 20, 8, 5]);
    expect(questionCount(15, 'alles')).toBe(15);
    // Nooit meer vragen dan er plekken zijn.
    expect(questionCount(2, 'normaal')).toBe(2);
  });

  it('maakt per deel een eigen, willekeurige keuze in de goede volgorde van de delen', () => {
    const deel1 = Array.from({ length: 50 }, (_, i) => `a${i}`);
    const deel2 = Array.from({ length: 10 }, (_, i) => `b${i}`);
    const questions = planToets([deel1, deel2], 'normaal');
    expect(questions).toHaveLength(30);
    expect(questions.slice(0, 25).every((q) => q.part === 0 && q.name.startsWith('a'))).toBe(true);
    expect(questions.slice(25).every((q) => q.part === 1 && q.name.startsWith('b'))).toBe(true);
    expect(new Set(questions.map((q) => q.name)).size).toBe(30);
  });
});

describe('oefentoets: bewaarsleutel', () => {
  it('houdt de oude sleutel voor opschrijven en een eigen sleutel voor aanwijzen', () => {
    expect(toetsKey('landen', 2, 'normaal')).toBe('landen:2:normaal');
    expect(toetsKey('landen', 2, 'normaal', 'schrijven')).toBe('landen:2:normaal');
    expect(toetsKey('landen', 2, 'normaal', 'aanwijzen')).toBe('landen:2:normaal:aanwijzen');
  });
});

describe('oefentoets: cijfer', () => {
  it('is goed / totaal × 10, op één decimaal', () => {
    expect(toetsGrade(20, 25)).toBe(8);
    expect(toetsGrade(17, 20)).toBe(8.5);
    expect(toetsGrade(2, 3)).toBe(6.7);
    expect(toetsGrade(0, 10)).toBe(0);
    expect(formatGrade(8.5)).toBe('8,5');
    expect(formatGrade(10)).toBe('10,0');
  });
});

describe('oefentoets: nakijken (topo, geen spelling)', () => {
  const landen = makeCandidates(
    places.map((p) => p.name),
    ALIASES,
    LOOKALIKES,
  );
  const goed = (typed: string, answer: string) => judgeAnswer(typed, answer, landen).correct;

  it('rekent precies goed, ook zonder hoofdletters, accenten of streepjes', () => {
    expect(judgeAnswer('italie', 'Italië', landen)).toEqual({ correct: true, exact: true });
    expect(judgeAnswer('zuid afrika', 'Zuid-Afrika', landen).exact).toBe(true);
    expect(judgeAnswer('Kongo', 'Democratische Republiek Kongo', landen).exact).toBe(true);
    // Een bekende andere naam telt als goed geschreven.
    expect(judgeAnswer('Amerika', 'Verenigde Staten', landen).exact).toBe(true);
  });

  it('rekent ook heel slordig geschreven namen goed als duidelijk is welk land het is', () => {
    for (const [typed, answer] of [
      ['Veneswela', 'Venezuela'],
      ['Madagascar', 'Madagaskar'],
      ['Kazagstan', 'Kazachstan'],
      ['saoedie arabie', 'Saudi-Arabië'],
      ['Filipijne', 'Filipijnen'],
      ['Mongoolie', 'Mongolië'],
      ['Afganistan', 'Afghanistan'],
      ['Etiopie', 'Ethiopië'],
      ['Nieuw Zeland', 'Nieuw-Zeeland'],
      ['papoea nieuw guinee', 'Papoea-Nieuw-Guinea'],
      ['Tanzanja', 'Tanzania'],
      ['jemmen', 'Jemen'],
      ['Egipte', 'Egypte'],
      ['Argentinia', 'Argentinië'],
    ] as const) {
      expect(judgeAnswer(typed, answer, landen), `${typed} → ${answer}`).toEqual({
        correct: true,
        exact: false,
      });
    }
  });

  it('rekent een ander land fout, ook als dat erop lijkt', () => {
    expect(goed('Irak', 'Iran')).toBe(false);
    expect(goed('Oostenrijk', 'Australië')).toBe(false);
    expect(goed('Niger', 'Nigeria')).toBe(false);
    expect(goed('Zwitserland', 'Zweden')).toBe(false);
    expect(goed('Noord-Korea', 'Zuid-Korea')).toBe(false);
    expect(goed('Oman', 'Jemen')).toBe(false);
    expect(goed('Paraguay', 'Uruguay')).toBe(false);
  });

  it('kent bekende andere namen in Nederland (Den Bosch, provincie zonder "(provincie)")', () => {
    const nl = makeCandidates(
      ["'s-Hertogenbosch", 'Utrecht', 'Utrecht (provincie)', 'Groningen', 'Groningen (provincie)'],
      ALIASES,
    );
    expect(judgeAnswer('Den Bosch', "'s-Hertogenbosch", nl).exact).toBe(true);
    expect(judgeAnswer('Utrecht', 'Utrecht (provincie)', nl).exact).toBe(true);
    expect(judgeAnswer('Utrecht', 'Utrecht', nl).exact).toBe(true);
    expect(judgeAnswer('Groningen', 'Groningen (provincie)', nl).correct).toBe(true);
  });

  it('rekent onzin en een leeg antwoord fout', () => {
    expect(goed('', 'Chili')).toBe(false);
    expect(goed('weet ik niet', 'Chili')).toBe(false);
    expect(goed('xxxx', 'Peru')).toBe(false);
  });

  it('rekent bij wateren ook de korte naam goed ("Atlantische" voor Atlantische Oceaan)', () => {
    const water = makeCandidates(waters.map((p) => p.name));
    const names = waters.map((p) => p.name);
    const withOcean = names.find((n) => /Atlantische/.test(n))!;
    expect(judgeAnswer('Atlantische', withOcean, water).correct).toBe(true);
    const redSea = names.find((n) => /Rode Zee/.test(n))!;
    expect(judgeAnswer('rode zee', redSea, water).exact).toBe(true);
  });

  it('rekent een naam zonder "gebergte", "meer" enz. erachter goed ("Oeral")', () => {
    const water = makeCandidates(
      waters.map((p) => p.name),
      ALIASES,
      LOOKALIKES,
    );
    for (const [typed, answer] of [
      ['Oeral', 'Oeralgebergte'],
      ['oeral', 'Oeralgebergte'],
      ['Andes', 'Andesgebergte'],
      ['Atlas', 'Atlasgebergte'],
      ['Gobi', 'Gobiwoestijn'],
      ['Kongo', 'Kongorivier'],
      ['Bajkal', 'Bajkalmeer'],
      ['Victoria', 'Victoriameer'],
      ['Barents', 'Barentszee'],
      ['Everest', 'Mount Everest'],
      ['Rocky', 'Rocky Mountains'],
    ] as const) {
      expect(judgeAnswer(typed, answer, water).correct, `${typed} → ${answer}`).toBe(true);
    }
    // Goed, en daarna zie je hoe je het helemaal schrijft.
    expect(judgeAnswer('Oeral', 'Oeralgebergte', water)).toEqual({ correct: true, exact: false });
    // Een ander gebergte blijft fout.
    expect(judgeAnswer('Oeral', 'Andesgebergte', water).correct).toBe(false);
  });

  it('rekent een korte naam niet goed als die bij een andere plek hoort (IJssel ≠ IJsselmeer)', () => {
    const nl = makeCandidates(
      nederland.map((p) => p.name),
      ALIASES,
      LOOKALIKES,
    );
    expect(judgeAnswer('IJssel', 'IJsselmeer', nl).correct).toBe(false);
    expect(judgeAnswer('IJssel', 'IJssel', nl)).toEqual({ correct: true, exact: true });
    expect(judgeAnswer('Veluwe', 'Veluwemeer', nl).correct).toBe(false);
    expect(judgeAnswer('Veluwe', 'Veluwe', nl).exact).toBe(true);
    expect(judgeAnswer('Grevelingen', 'Grevelingenmeer', nl).correct).toBe(true);
    expect(judgeAnswer('Lauwers', 'Lauwersmeer', nl).correct).toBe(true);
  });
});
