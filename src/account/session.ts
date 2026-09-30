// Wie er is ingelogd, voor de hele site. Schermen luisteren mee met
// useAccount(); het inloggen zelf loopt via de functies hieronder.

import { useSyncExternalStore } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getClient } from './client';
import { authErrorMessage, OFFLINE_MESSAGE, UNKNOWN_MESSAGE, type AuthErrorLike } from './messages';

export type Account =
  { status: 'loading' } | { status: 'out' } | { status: 'in'; userId: string; email: string };

let account: Account = { status: 'out' };
let started: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setAccount(next: Account): void {
  account = next;
  for (const listener of listeners) listener();
}

function fromSession(session: Session | null): Account {
  if (!session) return { status: 'out' };
  return { status: 'in', userId: session.user.id, email: session.user.email ?? '' };
}

export function getAccount(): Account {
  return account;
}

export function subscribeAccount(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function useAccount(): Account {
  return useSyncExternalStore(subscribeAccount, getAccount);
}

/** Laad Supabase en kijk of er iemand ingelogd is. Gebeurt maar één keer. */
export function startAccount(): Promise<void> {
  started ??= (async () => {
    setAccount({ status: 'loading' });
    try {
      const supabase = await getClient();
      supabase.auth.onAuthStateChange((_event, session) => setAccount(fromSession(session)));
      const { data } = await supabase.auth.getSession();
      setAccount(fromSession(data.session));
    } catch {
      started = null;
      setAccount({ status: 'out' });
    }
  })();
  return started;
}

export type Result = { ok: true } | { ok: false; message: string };

function failed(error: AuthErrorLike): Result {
  return { ok: false, message: authErrorMessage(error) };
}

/** Voer een actie uit; lukt het laden van Supabase niet, dan is er geen internet. */
async function run<R extends Result>(action: () => Promise<R>): Promise<R | Result> {
  try {
    return await action();
  } catch (error) {
    const offline = error instanceof TypeError || !navigator.onLine;
    return { ok: false, message: offline ? OFFLINE_MESSAGE : UNKNOWN_MESSAGE };
  }
}

export function signIn(email: string, password: string): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? failed(error) : { ok: true };
  });
}

export type SignUpResult = Result | { ok: true; checkMail: true };

/**
 * Maak een account. Meestal moet het e-mailadres eerst bevestigd worden
 * (checkMail); staat dat uit in Supabase, dan ben je meteen ingelogd.
 */
export function signUp(email: string, password: string): Promise<SignUpResult> {
  return run<SignUpResult>(async () => {
    const supabase = await getClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    if (error) return failed(error);
    // Bestaat het account al, dan geeft Supabase een gebruiker zonder identiteiten terug.
    if (data.user?.identities?.length === 0) return failed({ code: 'user_already_exists' });
    return data.session ? { ok: true } : { ok: true, checkMail: true };
  });
}

/** Stuur een mail met een link om een nieuw wachtwoord te kiezen. */
export function sendPasswordReset(email: string): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account?herstel`,
    });
    return error ? failed(error) : { ok: true };
  });
}

export function setNewPassword(password: string): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const { error } = await supabase.auth.updateUser({ password });
    return error ? failed(error) : { ok: true };
  });
}

/** Uitloggen op deze computer (andere computers blijven ingelogd). */
export function signOut(): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    return error ? failed(error) : { ok: true };
  });
}
