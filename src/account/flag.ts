// Accounts zijn nog in aanbouw. Tot ze af zijn (met synchroniseren en een
// privacyverklaring) is de accountknop verborgen. Eén keer ?account in de url
// zet hem aan in deze browser, ?account=uit zet hem weer uit. Wie al ingelogd
// is, ziet de knop altijd.

import { SESSION_KEY, TEST_FLAG_KEY } from './config';

type FlagStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readAccountFlag(search: string, store: FlagStore): boolean {
  const value = new URLSearchParams(search).get('account');
  if (value === 'uit') {
    store.removeItem(TEST_FLAG_KEY);
    return false;
  }
  if (value !== null) {
    store.setItem(TEST_FLAG_KEY, '1');
    return true;
  }
  return store.getItem(TEST_FLAG_KEY) === '1';
}

function browserStore(): FlagStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Mag de accountknop getoond worden? */
export function accountsVisible(search: string): boolean {
  const store = browserStore();
  if (!store) return false;
  try {
    return readAccountFlag(search, store);
  } catch {
    return false;
  }
}

/** Is er in deze browser al iemand ingelogd (zonder Supabase te hoeven laden)? */
export function hasStoredSession(): boolean {
  try {
    return browserStore()?.getItem(SESSION_KEY) != null;
  } catch {
    return false;
  }
}
