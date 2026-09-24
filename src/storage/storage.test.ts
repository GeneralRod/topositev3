import { beforeEach, describe, expect, it } from 'vitest';
import { loadSaveData, migrateLegacyGame, STORAGE_KEY, type KeyValueStore } from './storage';
import * as storage from './index';

function fakeStore(initial: Record<string, string> = {}): KeyValueStore & {
  map: Map<string, string>;
} {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

// Zo sloeg de oude versie van de site een spel op.
const legacyGame = {
  cityStatus: { Parijs: 'green', Berlijn: 'blue', Rome: 'unanswered' },
  cityMistakes: { Parijs: 0, Berlijn: 2, Rome: 0 },
  score: 1,
  currentAttempts: 1,
  hintUsed: true,
  currentCity: { name: 'Rome', country: 'Italië', lat: 41.9, lng: 12.5, continent: 'Europa' },
  selectedPackage: 'pakket1',
  lastUpdated: 1700000000000,
  sessionCoins: 17,
  coinsThisGame: 17,
};

describe('overzetten van oude gegevens', () => {
  it('neemt munten, linten, prijzen en spellen over', () => {
    const store = fakeStore({
      topositev2_total_coins: '345',
      topositev2_ribbons_owned: JSON.stringify({ 'ribbon-red': 2 }),
      topositev2_real_prizes_owned: JSON.stringify(['globe']),
      topografie_game_state_pakket1: JSON.stringify(legacyGame),
      'topografie_game_state_pakket1-2': JSON.stringify(legacyGame),
      iets_anders: 'x',
    });

    const data = loadSaveData(store);

    // 345 munten + 2 rode linten van 100 terugbetaald
    expect(data.coins).toBe(545);
    expect(data.prizes).toEqual(['globe']);
    expect(data.stickers).toEqual([]);
    expect(Object.keys(data.games).sort()).toEqual(['pakket1', 'pakket1-2']);
    expect(data.games.pakket1).toEqual({
      status: { Parijs: 'green', Berlijn: 'blue', Rome: 'unanswered' },
      mistakes: { Parijs: 0, Berlijn: 2, Rome: 0 },
      currentCity: 'Rome',
      attempts: 1,
      hintUsed: true,
      coinsThisGame: 17,
      bonusPaid: false,
    });
  });

  it('bewaart het resultaat onder de nieuwe sleutel en laat de oude staan', () => {
    const store = fakeStore({ topositev2_total_coins: '10' });
    loadSaveData(store);
    expect(JSON.parse(store.map.get(STORAGE_KEY)!)).toMatchObject({ version: 2, coins: 10 });
    expect(store.map.get('topositev2_total_coins')).toBe('10');
  });

  it('zet niet opnieuw over als de nieuwe sleutel al bestaat', () => {
    const store = fakeStore({ topositev2_total_coins: '10' });
    loadSaveData(store);
    store.setItem('topositev2_total_coins', '999');
    expect(loadSaveData(store).coins).toBe(10);
  });

  it('telt een afgerond oud spel als bonus al betaald', () => {
    const game = migrateLegacyGame({
      ...legacyGame,
      cityStatus: { Parijs: 'green', Berlijn: 'green' },
    });
    expect(game?.bonusPaid).toBe(true);
  });

  it('overleeft kapotte of vreemde gegevens', () => {
    const store = fakeStore({
      topositev2_total_coins: 'abc',
      topositev2_ribbons_owned: '{kapot',
      topositev2_real_prizes_owned: JSON.stringify(['globe', 5]),
      topografie_game_state_pakket2: 'null',
      topografie_game_state_pakket3: JSON.stringify({ cityStatus: { Rome: 'paars' } }),
    });
    const data = loadSaveData(store);
    expect(data.coins).toBe(0);
    expect(data.prizes).toEqual(['globe']);
    expect(data.games.pakket2).toBeUndefined();
    expect(data.games.pakket3.status).toEqual({});
  });

  it('begint leeg voor een nieuwe speler', () => {
    expect(loadSaveData(fakeStore())).toEqual({
      version: 2,
      coins: 0,
      prizes: [],
      stickers: [],
      upgrades: [],
      style: { finish: 'oak', extras: [] },
      games: {},
      cityStats: {},
      stars: {},
    });
  });
});

describe('versie 2 zonder upgrades (van voor de werkplaats)', () => {
  it('krijgt de standaardkast', () => {
    const store = fakeStore({
      [STORAGE_KEY]: JSON.stringify({ version: 2, coins: 5, prizes: ['globe'], stickers: [] }),
    });
    const data = loadSaveData(store);
    expect(data.upgrades).toEqual([]);
    expect(data.style).toEqual({ finish: 'oak', extras: [] });
    expect(data.prizes).toEqual(['globe']);
  });
});

describe('van versie 1 naar versie 2 (nieuwe prijzenkast)', () => {
  const v1 = {
    version: 1,
    coins: 50,
    ribbons: { 'ribbon-red': 1, 'ribbon-gold': 2, onbekend: 3 },
    realPrizes: ['globe', 'cup', 'door-sticker', 'globe', 'raar-ding'],
    games: { pakket1: migrateLegacyGame(legacyGame) },
  };

  it('houdt bestaande prijzen en betaalt verdwenen spullen terug in munten', () => {
    const store = fakeStore({ [STORAGE_KEY]: JSON.stringify(v1) });
    const data = loadSaveData(store);
    expect(data.prizes).toEqual(['globe', 'cup']);
    // 50 + rood lint 100 + 2 gouden linten 400 + deur-sticker 150
    expect(data.coins).toBe(700);
    expect(data.games.pakket1.currentCity).toBe('Rome');
  });

  it('betaalt maar één keer terug', () => {
    const store = fakeStore({ [STORAGE_KEY]: JSON.stringify(v1) });
    loadSaveData(store);
    expect(JSON.parse(store.map.get(STORAGE_KEY)!).version).toBe(2);
    expect(loadSaveData(store).coins).toBe(700);
  });
});

describe('opslag in de app', () => {
  let store: ReturnType<typeof fakeStore>;

  beforeEach(() => {
    store = fakeStore({ topositev2_total_coins: '20' });
    storage.setStoreForTesting(store);
  });

  it('telt munten op en bewaart ze meteen', () => {
    storage.addCoins(5);
    expect(storage.getCoins()).toBe(25);
    storage.setStoreForTesting(store);
    expect(storage.getCoins()).toBe(25);
  });

  it('geeft alleen munten uit als er genoeg zijn', () => {
    expect(storage.spendCoins(50)).toBe(false);
    expect(storage.spendCoins(15)).toBe(true);
    expect(storage.getCoins()).toBe(5);
  });

  it('koopt een prijs alleen met genoeg munten en maar één keer', () => {
    expect(storage.buyItem('prize', 'globe', 50)).toBe(false);
    expect(storage.buyItem('prize', 'compass', 15)).toBe(true);
    expect(storage.buyItem('prize', 'compass', 1)).toBe(false);
    expect(storage.getPrizes()).toEqual(['compass']);
    expect(storage.getCoins()).toBe(5);
    expect(storage.buyItem('sticker', 'ster', 5)).toBe(true);
    expect(storage.getStickers()).toEqual(['ster']);
    expect(storage.getCoins()).toBe(0);
  });

  it('koopt kast-upgrades en bewaart de gekozen stijl', () => {
    expect(storage.buyItem('upgrade', 'cherry', 20)).toBe(true);
    storage.setStyle({ finish: 'cherry', extras: [] });
    storage.setStoreForTesting(store);
    expect(storage.getUpgrades()).toEqual(['cherry']);
    expect(storage.getStyle()).toEqual({ finish: 'cherry', extras: [] });
  });

  it('houdt lastige steden per onderwerp bij', () => {
    storage.recordCityAnswer('capitals', 'Lima', 'wrong');
    storage.setStoreForTesting(store);
    expect(storage.getCityStats('capitals')).toEqual({ Lima: { wrong: 1, streak: 0 } });
    expect(storage.getCityStats('europa')).toEqual({});
  });

  it('bewaart alleen betere sterren', () => {
    storage.recordStars('pakket1', 2);
    storage.recordStars('pakket1', 1);
    expect(storage.getStars()).toEqual({ pakket1: 2 });
    storage.recordStars('pakket1', 3);
    storage.setStoreForTesting(store);
    expect(storage.getStars()).toEqual({ pakket1: 3 });
  });

  it('bewaart en wist spellen per pakket', () => {
    const game = migrateLegacyGame(legacyGame)!;
    storage.saveGame('pakket2', game);
    storage.setStoreForTesting(store);
    expect(storage.loadGame('pakket2')).toEqual(game);
    storage.clearGame('pakket2');
    expect(storage.loadGame('pakket2')).toBeNull();
  });

  it('blijft werken als opslaan mislukt', () => {
    store.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    storage.addCoins(1);
    expect(storage.getCoins()).toBe(21);
  });
});
