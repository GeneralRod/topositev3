// Inloggen op een computer waar al voortgang staat (wens eigenaar): er mag nooit
// voortgang verloren gaan. Supabase is hier nagemaakt; de rest is echt.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptySaveData, type SaveData } from '../storage/storage';
import type { Backend } from './sync';

vi.mock('./client', () => ({ getClient: vi.fn() }));
vi.mock('./remote', () => ({ supabaseBackend: vi.fn() }));

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

/** Eén rij online per account. */
function fakeServer() {
  const rows = new Map<string, { data: SaveData; revision: number }>();
  const backendFor = (userId: string): Backend => ({
    async fetch() {
      const row = rows.get(userId);
      return row ? clone(row) : null;
    },
    async update(data, revision) {
      const row = rows.get(userId);
      if (!row || row.revision !== revision) return null;
      rows.set(userId, { data: clone(data), revision: revision + 1 });
      return revision + 1;
    },
    async insert(data) {
      if (rows.has(userId)) return null;
      rows.set(userId, { data: clone(data), revision: 1 });
      return 1;
    },
  });
  return { rows, backendFor };
}

/** Nep-Supabase: alleen inloggen en uitloggen. */
function fakeSupabase() {
  type Listener = (event: string, session: unknown) => void;
  let listener: Listener = () => {};
  let session: { user: { id: string; email: string } } | null = null;
  return {
    logIn(userId: string) {
      session = { user: { id: userId, email: `${userId}@school.nl` } };
      listener('SIGNED_IN', session);
    },
    auth: {
      onAuthStateChange(callback: Listener) {
        listener = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async getSession() {
        return { data: { session } };
      },
      async signOut() {
        session = null;
        listener('SIGNED_OUT', null);
        return { error: null };
      },
    },
  };
}

let local: ReturnType<typeof memory>;
let server: ReturnType<typeof fakeServer>;
let supabase: ReturnType<typeof fakeSupabase>;

/** Een verse site (alle modules opnieuw), met deze computer en deze server. */
async function openSite() {
  vi.resetModules();
  const client = await import('./client');
  const remote = await import('./remote');
  vi.mocked(client.getClient).mockResolvedValue(supabase as never);
  vi.mocked(remote.supabaseBackend).mockImplementation((_, userId) => server.backendFor(userId));
  const storage = await import('../storage');
  const session = await import('./session');
  await session.startAccount();
  return { storage, session };
}

async function logIn(session: Awaited<ReturnType<typeof openSite>>['session'], userId: string) {
  supabase.logIn(userId);
  await vi.runAllTimersAsync();
  return session;
}

beforeEach(() => {
  vi.useFakeTimers();
  local = memory();
  server = fakeServer();
  supabase = fakeSupabase();
  vi.stubGlobal('window', {
    localStorage: local,
    addEventListener() {},
    location: { origin: 'http://localhost' },
  });
  vi.stubGlobal('document', { addEventListener() {}, visibilityState: 'visible' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Een kind dat zonder account al heeft gespeeld. */
async function guestHasPlayed() {
  const { storage } = await openSite();
  storage.addCoins(120);
  storage.recordStars('pakket1', 3);
  storage.buyItem('prize', 'globe', 20);
}

describe('eerste keer inloggen op een computer met voortgang', () => {
  it('vraagt eerst, en zet nog niets online', async () => {
    await guestHasPlayed();
    const { session, storage } = await openSite();
    await logIn(session, 'anna');

    expect(session.getAccount()).toMatchObject({ status: 'in', userId: 'anna' });
    expect(session.getGuestQuestion()).toEqual({
      userId: 'anna',
      summary: '100 munten, 3 sterren en 1 prijs',
    });
    expect(storage.getCoins()).toBe(100);
    expect(server.rows.has('anna')).toBe(false);
  });

  it('ja: de voortgang komt op het account, ook bovenop wat er al stond', async () => {
    server.rows.set('anna', { data: { ...emptySaveData(), coins: 300 }, revision: 1 });
    await guestHasPlayed();
    const { session, storage } = await openSite();
    await logIn(session, 'anna');
    await session.answerGuestQuestion(true);
    await vi.runAllTimersAsync();

    expect(session.getGuestQuestion()).toBeNull();
    expect(storage.getCoins()).toBe(400);
    expect(server.rows.get('anna')?.data.coins).toBe(400);
    expect(server.rows.get('anna')?.data.prizes).toEqual(['globe']);
    expect(server.rows.get('anna')?.data.stars).toEqual({ pakket1: 3 });
  });

  it('nee: niet op het account, en na uitloggen staat alles er weer', async () => {
    await guestHasPlayed();
    const { session, storage } = await openSite();
    await logIn(session, 'bram');
    await session.answerGuestQuestion(false);
    await vi.runAllTimersAsync();

    expect(storage.getCoins()).toBe(0);
    expect(server.rows.get('bram')?.data.coins).toBe(0);
    expect(session.getKeptGuest()?.coins).toBe(100);

    // Bram speelt, logt uit: zijn munten op zijn account, de rest terug op de computer.
    storage.addCoins(7);
    expect(await session.signOut()).toEqual({ ok: true });
    expect(server.rows.get('bram')?.data.coins).toBe(7);
    expect(storage.getCoins()).toBe(100);
    expect(storage.getPrizes()).toEqual(['globe']);
    expect(session.getKeptGuest()).toBeNull();
  });

  it('nee, en later toch van mij: alsnog op het account', async () => {
    await guestHasPlayed();
    const { session, storage } = await openSite();
    await logIn(session, 'anna');
    await session.answerGuestQuestion(false);
    await vi.runAllTimersAsync();

    expect(await session.adoptKeptGuest()).toBe(true);
    expect(storage.getCoins()).toBe(100);
    expect(server.rows.get('anna')?.data.coins).toBe(100);
    expect(session.getKeptGuest()).toBeNull();
  });

  it('tabblad dicht zonder antwoord: de volgende keer wordt het weer gevraagd', async () => {
    await guestHasPlayed();
    const first = await openSite();
    await logIn(first.session, 'anna');
    // Tabblad dicht; Anna is nog ingelogd als ze de site weer opent.
    const { session, storage } = await openSite();
    await vi.runAllTimersAsync();

    expect(session.getAccount()).toMatchObject({ status: 'in', userId: 'anna' });
    expect(storage.getCoins()).toBe(100);
    expect(server.rows.has('anna')).toBe(false);
    await session.answerGuestQuestion(true);
    await vi.runAllTimersAsync();
    expect(server.rows.get('anna')?.data.coins).toBe(100);
  });

  it('uitloggen zonder antwoord: de voortgang van de computer blijft staan', async () => {
    await guestHasPlayed();
    const { session, storage } = await openSite();
    await logIn(session, 'anna');
    expect(await session.signOut()).toEqual({ ok: true });

    expect(storage.getCoins()).toBe(100);
    expect(server.rows.has('anna')).toBe(false);
  });

  it('geen voortgang op de computer: niets te vragen', async () => {
    const { session, storage } = await openSite();
    await logIn(session, 'anna');

    expect(session.getGuestQuestion()).toBeNull();
    expect(server.rows.get('anna')?.data.coins).toBe(0);
    expect(storage.getCoins()).toBe(0);
  });
});
