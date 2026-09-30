// Voortgang van het account bijhouden: ophalen, samenvoegen en online bewaren.
//
// De site bewaart altijd eerst in de browser (src/storage). Is iemand ingelogd,
// dan stuurt deze module elke wijziging een paar seconden later door naar de
// database, en haalt hij bij het inloggen en bij terugkomen in het tabblad op
// wat er online staat. Zonder internet speel je door; het wordt later bijgewerkt.
//
// De 'basis' is hoe de voortgang eruitzag bij het laatste bijwerken met het
// account (bewaard in de browser). Daarmee weet samenvoegen (storage/merge.ts)
// wat er sindsdien nieuw is, zodat munten en fouten maar één keer tellen.
// Online telt 'revision' op bij elke wijziging; staat die niet meer waar we
// hem verwachtten, dan heeft een andere computer iets bewaard en voegen we eerst
// samen.

import { useSyncExternalStore } from 'react';
import {
  getSaveData,
  mergeSaveData,
  replaceSaveData,
  sameData,
  subscribe,
  type SaveData,
} from '../storage';
import { emptySaveData, parseSaveData } from '../storage/storage';

export interface RemoteRow {
  data: unknown;
  revision: number;
}

/** Wat er online gebeurt; in tests een nep-versie. Fouten (bijv. geen internet) gooien. */
export interface Backend {
  fetch(): Promise<RemoteRow | null>;
  /** Alleen bewaren als de revision online nog `revision` is; null = een ander was je voor. */
  update(data: SaveData, revision: number): Promise<number | null>;
  /** De rij voor het eerst maken; null = hij bestond al. */
  insert(data: SaveData): Promise<number | null>;
}

export interface BaseRecord {
  userId: string;
  revision: number;
  data: SaveData;
}

type BaseStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const BASE_KEY = 'topografiewereld_sync';
/** Zo lang na de laatste wijziging wordt er online bewaard. */
export const PUSH_DELAY = 3000;
/** Zo lang na een mislukte poging (bijv. geen internet) opnieuw proberen. */
export const RETRY_DELAY = 30000;
const MAX_ATTEMPTS = 3;

export function loadBase(store: BaseStore): BaseRecord | null {
  try {
    const raw: unknown = JSON.parse(store.getItem(BASE_KEY) ?? 'null');
    if (typeof raw !== 'object' || raw === null) return null;
    const { userId, revision, data } = raw as Record<string, unknown>;
    const save = parseSaveData(data);
    if (typeof userId !== 'string' || typeof revision !== 'number' || !save) return null;
    return { userId, revision, data: save };
  } catch {
    return null;
  }
}

function saveBase(store: BaseStore, base: BaseRecord | null): void {
  try {
    if (base) store.setItem(BASE_KEY, JSON.stringify(base));
    else store.removeItem(BASE_KEY);
  } catch {
    // Opslag vol of geblokkeerd: dan telt de volgende keer als eerste keer.
  }
}

/**
 * Waar samenvoegen vanuit gaat. Hoorde de voortgang in deze browser bij een
 * ander account (dat niet netjes uitlogde), dan staat die al online bij dat
 * account en nemen we hem niet mee.
 */
export function startingPoint(
  base: BaseRecord | null,
  userId: string,
  local: SaveData,
): { base: SaveData | null; local: SaveData } {
  if (!base) return { base: null, local };
  if (base.userId === userId) return { base: base.data, local };
  return { base: null, local: emptySaveData() };
}

// --- Status voor het scherm -------------------------------------------------

/** saved = alles staat online, pending = wacht op bewaren, offline = mislukt, probeert later. */
export type SyncStatus = 'off' | 'pending' | 'saved' | 'offline';

let status: SyncStatus = 'off';
const statusListeners = new Set<() => void>();

function setStatus(next: SyncStatus): void {
  if (next === status) return;
  status = next;
  for (const listener of statusListeners) listener();
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore((listener) => {
    statusListeners.add(listener);
    return () => void statusListeners.delete(listener);
  }, getSyncStatus);
}

// --- Het bijhouden zelf -----------------------------------------------------

export interface Sync {
  userId: string;
  /** Ophalen en samenvoegen (bij inloggen en terugkomen in het tabblad). */
  pull(): Promise<boolean>;
  /** Wat nog wacht meteen bewaren; true als alles online staat. */
  flush(): Promise<boolean>;
  stop(): void;
}

export function createSync(userId: string, backend: Backend, baseStore: BaseStore): Sync {
  let base = loadBase(baseStore);
  let queue: Promise<boolean> = Promise.resolve(true);
  let pushTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  /** Na bewaren: basis bijwerken, en wat er intussen gespeeld is erbij houden. */
  function settle(snapshot: SaveData, written: SaveData, revision: number): void {
    if (stopped) return;
    base = { userId, revision, data: written };
    saveBase(baseStore, base);
    const current = getSaveData();
    const next = sameData(current, snapshot) ? written : mergeSaveData(snapshot, current, written);
    if (!sameData(next, current)) replaceSaveData(next);
    if (!sameData(next, written)) schedulePush();
  }

  async function fullSync(): Promise<void> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const snapshot = getSaveData();
      const remote = await backend.fetch();
      if (stopped) return;
      const upToDate =
        remote !== null &&
        base?.userId === userId &&
        remote.revision === base.revision &&
        sameData(snapshot, base.data);
      if (upToDate) return;

      const remoteData = remote ? (parseSaveData(remote.data) ?? emptySaveData()) : null;
      const start = startingPoint(base, userId, snapshot);
      const merged = mergeSaveData(start.base, start.local, remoteData ?? emptySaveData());
      let revision: number | null;
      if (!remote) revision = await backend.insert(merged);
      else if (remoteData && sameData(merged, remoteData)) revision = remote.revision;
      else revision = await backend.update(merged, remote.revision);
      if (revision !== null) return settle(snapshot, merged, revision);
      // Een andere computer was ons net voor: opnieuw ophalen en samenvoegen.
    }
    throw new Error('Bewaren lukt steeds niet: te veel tegelijk gewijzigd.');
  }

  async function push(): Promise<void> {
    const snapshot = getSaveData();
    if (base?.userId === userId) {
      if (sameData(snapshot, base.data)) return;
      const revision = await backend.update(snapshot, base.revision);
      if (revision !== null) return settle(snapshot, snapshot, revision);
    }
    await fullSync();
  }

  /** Eén ding tegelijk; mislukt het, dan later opnieuw. */
  function run(task: () => Promise<void>): Promise<boolean> {
    queue = queue.then(async () => {
      if (stopped) return false;
      clearTimeout(retryTimer);
      try {
        await task();
        if (!stopped && pushTimer === undefined) setStatus('saved');
        return true;
      } catch {
        if (stopped) return false;
        setStatus('offline');
        retryTimer = setTimeout(() => void run(push), RETRY_DELAY);
        return false;
      }
    });
    return queue;
  }

  function schedulePush(): void {
    if (stopped) return;
    clearTimeout(pushTimer);
    if (status !== 'offline') setStatus('pending');
    pushTimer = setTimeout(() => {
      pushTimer = undefined;
      void run(push);
    }, PUSH_DELAY);
  }

  // Alleen gewone wijzigingen tijdens het spelen; vervangen doet deze module zelf.
  const unsubscribe = subscribe((_, reason) => {
    if (reason === 'change') schedulePush();
  });

  setStatus('pending');
  void run(fullSync);

  return {
    userId,
    pull: () => run(fullSync),
    flush: () => {
      if (pushTimer !== undefined) {
        clearTimeout(pushTimer);
        pushTimer = undefined;
      }
      return run(push);
    },
    stop: () => {
      stopped = true;
      clearTimeout(pushTimer);
      clearTimeout(retryTimer);
      pushTimer = undefined;
      unsubscribe();
      setStatus('off');
    },
  };
}

/** Na uitloggen: niets van dit account achterlaten op deze computer. */
export function forgetAccountData(baseStore: BaseStore): void {
  saveBase(baseStore, null);
  replaceSaveData(emptySaveData());
}
