import { SESSION_KEY } from './config';

/** Is er in deze browser al iemand ingelogd (zonder Supabase te hoeven laden)? */
export function hasStoredSession(): boolean {
  try {
    return window.localStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}
