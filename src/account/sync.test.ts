import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as storage from '../storage';
import { emptySaveData, type KeyValueStore, type SaveData } from '../storage/storage';
import {
  BASE_KEY,
  createSync,
  forgetAccountData,
  getSyncStatus,
  loadBase,
  PUSH_DELAY,
  RETRY_DELAY,
  type Backend,
  type Sync,
} from './sync';

function memory() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Een nep-database met één rij, die ook 'geen internet' kan spelen. */
function fakeServer(initial?: Partial<SaveData>) {
  let row: { data: SaveData; revision: number } | null = initial
    ? { data: { ...emptySaveData(), ...initial }, revision: 1 }
    : null;
  let online = true;
  let gate: Promise<void> | null = null;
  const calls: string[] = [];
  const check = async (name: string) => {
    calls.push(name);
    if (gate) await gate;
    if (!online) throw new TypeError('Failed to fetch');
  };
  const backend: Backend = {
    async fetch() {
      await check('fetch');
      return row && clone(row);
    },
    async update(data, revision) {
      await check('update');
      if (!row || row.revision !== revision) return null;
      row = { data: clone(data), revision: revision + 1 };
      return row.revision;
    },
    async insert(data) {
      await check('insert');
      if (row) return null;
      row = { data: clone(data), revision: 1 };
      return 1;
    },
  };
  return {
    backend,
    calls,
    get row() {
      return row;
    },
    setOnline(value: boolean) {
      online = value;
    },
    /** Laat de volgende verzoeken wachten tot open() wordt aangeroepen. */
    hold() {
      let open!: () => void;
      gate = new Promise((resolve) => (open = resolve));
      return () => {
        gate = null;
        open();
      };
    },
    /** Een andere computer bewaart intussen iets. */
    otherComputer(change: (data: SaveData) => SaveData) {
      row = { data: change(row!.data), revision: row!.revision + 1 };
    },
  };
}

let game: ReturnType<typeof memory>;
let baseStore: ReturnType<typeof memory>;
let sync: Sync | null = null;

function start(server: ReturnType<typeof fakeServer>, userId = 'anna'): Sync {
  sync = createSync(userId, server.backend, baseStore);
  return sync;
}

beforeEach(() => {
  vi.useFakeTimers();
  game = memory();
  baseStore = memory();
  storage.setStoreForTesting(game as KeyValueStore);
});

afterEach(() => {
  sync?.stop();
  sync = null;
  vi.useRealTimers();
});

describe('inloggen', () => {
  it('zet de voortgang van deze computer online als het account nog leeg is', async () => {
    storage.addCoins(120);
    storage.recordStars('pakket1', 2);
    const server = fakeServer();
    await start(server).flush();

    expect(server.row?.data.coins).toBe(120);
    expect(server.row?.data.stars).toEqual({ pakket1: 2 });
    expect(loadBase(baseStore)).toMatchObject({ userId: 'anna', revision: 1 });
    expect(getSyncStatus()).toBe('saved');
  });

  it('voegt voortgang zonder account samen met die van het account', async () => {
    storage.addCoins(120);
    storage.buyItem('prize', 'globe', 20);
    const server = fakeServer({ coins: 300, prizes: ['atlas'], stars: { pakket1: 3 } });
    await start(server).flush();

    expect(storage.getCoins()).toBe(400);
    expect(storage.getPrizes()).toEqual(['atlas', 'globe']);
    expect(storage.getStars()).toEqual({ pakket1: 3 });
    expect(server.row?.data).toEqual(storage.getSaveData());
  });

  it('haalt alleen op als er niets veranderd is', async () => {
    const server = fakeServer({ coins: 50 });
    const s = start(server);
    await s.flush();
    server.calls.length = 0;
    await s.pull();
    expect(server.calls).toEqual(['fetch']);
  });

  it('neemt voortgang van een ander account in deze browser niet mee', async () => {
    const bram = fakeServer({ coins: 70 });
    await start(bram, 'bram').flush();
    sync!.stop();
    // Bram logt niet netjes uit; Anna logt in op dezelfde computer.
    const anna = fakeServer({ coins: 10 });
    await start(anna, 'anna').flush();

    expect(storage.getCoins()).toBe(10);
    expect(anna.row?.data.coins).toBe(10);
  });
});

describe('tijdens het spelen', () => {
  it('bewaart wijzigingen een paar seconden later online', async () => {
    const server = fakeServer({ coins: 100 });
    await start(server).flush();
    server.calls.length = 0;

    storage.addCoins(5);
    storage.addCoins(5);
    expect(getSyncStatus()).toBe('pending');
    await vi.advanceTimersByTimeAsync(PUSH_DELAY - 1);
    expect(server.calls).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);

    expect(server.calls).toEqual(['update']);
    expect(server.row?.data.coins).toBe(110);
    expect(getSyncStatus()).toBe('saved');
  });

  it('voegt samen als een andere computer intussen iets bewaarde', async () => {
    const server = fakeServer({ coins: 100 });
    const s = start(server);
    await s.flush();

    server.otherComputer((d) => ({ ...d, coins: d.coins + 50, prizes: ['globe'] }));
    storage.addCoins(10);
    await s.flush();

    expect(storage.getCoins()).toBe(160);
    expect(storage.getPrizes()).toEqual(['globe']);
    expect(server.row?.data.coins).toBe(160);
    expect(server.row?.revision).toBe(3);
  });

  it('houdt wat er gespeeld wordt terwijl er bewaard wordt', async () => {
    const server = fakeServer({ coins: 100 });
    const s = start(server);
    const open = server.hold();
    // Terwijl de server nog bezig is, verdient de speler munten.
    storage.addCoins(5);
    open();
    await s.flush();
    await vi.advanceTimersByTimeAsync(PUSH_DELAY);

    expect(storage.getCoins()).toBe(105);
    expect(server.row?.data.coins).toBe(105);
  });

  it('speelt door zonder internet en bewaart later', async () => {
    const server = fakeServer({ coins: 100 });
    const s = start(server);
    await s.flush();

    server.setOnline(false);
    storage.addCoins(25);
    await vi.advanceTimersByTimeAsync(PUSH_DELAY);
    expect(getSyncStatus()).toBe('offline');
    expect(storage.getCoins()).toBe(125);
    expect(await s.flush()).toBe(false);

    server.setOnline(true);
    await vi.advanceTimersByTimeAsync(RETRY_DELAY);
    expect(server.row?.data.coins).toBe(125);
    expect(getSyncStatus()).toBe('saved');
  });
});

describe('uitloggen', () => {
  it('bewaart niets meer na stoppen en laat niets achter', async () => {
    const server = fakeServer({ coins: 100 });
    const s = start(server);
    await s.flush();
    s.stop();
    forgetAccountData(baseStore);

    expect(storage.getCoins()).toBe(0);
    expect(baseStore.map.has(BASE_KEY)).toBe(false);
    storage.addCoins(3);
    await vi.advanceTimersByTimeAsync(PUSH_DELAY * 2);
    expect(server.row?.data.coins).toBe(100);
    expect(getSyncStatus()).toBe('off');
  });

  it('telt munten niet dubbel als je later weer inlogt', async () => {
    const server = fakeServer({ coins: 100 });
    await start(server).flush();
    sync!.stop();
    forgetAccountData(baseStore);

    await start(server).flush();
    expect(storage.getCoins()).toBe(100);
    expect(server.row?.data.coins).toBe(100);
  });
});
