// Wie er is ingelogd, voor de hele site. Schermen luisteren mee met
// useAccount(); het inloggen zelf loopt via de functies hieronder.

import { useSyncExternalStore } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getClient } from './client';
import { authErrorMessage, OFFLINE_MESSAGE, UNKNOWN_MESSAGE, type AuthErrorLike } from './messages';
import { supabaseBackend } from './remote';
import { getSaveData, mergeSaveData, replaceSaveData, type SaveData } from '../storage';
import { emptySaveData } from '../storage/storage';
import { keepGuest, needsGuestQuestion, progressSummary, readGuest, takeGuest } from './guest';
import { createSync, forgetAccountData, loadBase, type Sync } from './sync';

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

// --- Voortgang bijhouden zolang je ingelogd bent (zie sync.ts) ---------------

let sync: Sync | null = null;

function syncStore(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    return window.localStorage;
  } catch {
    const map = new Map<string, string>();
    return {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => void map.set(key, value),
      removeItem: (key) => void map.delete(key),
    };
  }
}

function followAccount(supabase: SupabaseClient, next: Account): void {
  const userId = next.status === 'in' ? next.userId : null;
  if ((sync?.userId ?? question?.userId ?? null) === userId) return;
  sync?.stop();
  sync = null;
  setQuestion(null);
  if (!userId) return;
  const store = syncStore();
  const local = getSaveData();
  // Eerste keer inloggen op deze computer en er staat al voortgang: eerst vragen
  // van wie die is (zie guest.ts). Tot het antwoord wordt er niets bijgewerkt.
  if (needsGuestQuestion(loadBase(store), local)) {
    setQuestion({ userId, summary: progressSummary(local) });
    return;
  }
  sync = createSync(userId, supabaseBackend(supabase, userId), store);
}

// --- Voortgang die al op deze computer stond (zie guest.ts) -----------------

export interface GuestQuestion {
  userId: string;
  /** "120 munten, 7 sterren en 3 prijzen" */
  summary: string;
}

let question: GuestQuestion | null = null;
const questionListeners = new Set<() => void>();

function setQuestion(next: GuestQuestion | null): void {
  if (next === question) return;
  question = next;
  for (const listener of questionListeners) listener();
}

/** De vraag die nu beantwoord moet worden, of null. */
export function getGuestQuestion(): GuestQuestion | null {
  return question;
}

export function useGuestQuestion(): GuestQuestion | null {
  return useSyncExternalStore((listener) => {
    questionListeners.add(listener);
    return () => void questionListeners.delete(listener);
  }, getGuestQuestion);
}

/**
 * Antwoord op "is deze voortgang van jou?". Ja: samenvoegen met het account.
 * Nee: apart zetten; na uitloggen staat hij weer op de computer. Lukt apart
 * zetten niet, dan voegen we toch samen: liever op het account dan kwijt.
 */
export async function answerGuestQuestion(mine: boolean): Promise<void> {
  const asked = question;
  if (!asked) return;
  const supabase = await getClient();
  if (question !== asked) return;
  const store = syncStore();
  // Is er al een basis, dan is de vraag in een ander tabblad al beantwoord.
  if (!mine && loadBase(store) === null && keepGuest(store, getSaveData())) {
    replaceSaveData(emptySaveData());
  }
  setQuestion(null);
  sync = createSync(asked.userId, supabaseBackend(supabase, asked.userId), store);
}

/** Apart gezette voortgang van deze computer (na "nee"), of null. */
export function getKeptGuest(): SaveData | null {
  return readGuest(syncStore());
}

/** Toch van mij: de apart gezette voortgang alsnog bij het account zetten. */
export async function adoptKeptGuest(): Promise<boolean> {
  if (!sync) return false;
  const kept = takeGuest(syncStore());
  if (!kept) return true;
  // Zonder basis: munten van allebei tellen op, van de rest het beste.
  replaceSaveData(mergeSaveData(null, getSaveData(), kept));
  return sync.flush();
}

function listenToBrowser(): void {
  // Weer internet: bewaren wat nog wacht.
  window.addEventListener('online', () => void sync?.flush());
  // Tabblad weg: meteen bewaren. Terug: ophalen wat een andere computer bewaarde.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void sync?.flush();
    else void sync?.pull();
  });
}

/** Laad Supabase en kijk of er iemand ingelogd is. Gebeurt maar één keer. */
export function startAccount(): Promise<void> {
  started ??= (async () => {
    setAccount({ status: 'loading' });
    try {
      const supabase = await getClient();
      const apply = (session: Session | null) => {
        const next = fromSession(session);
        setAccount(next);
        // Pas na afloop van deze melding met de database praten (advies van Supabase).
        setTimeout(() => followAccount(supabase, next), 0);
      };
      supabase.auth.onAuthStateChange((_event, session) => apply(session));
      const { data } = await supabase.auth.getSession();
      apply(data.session);
      listenToBrowser();
    } catch {
      started = null;
      setAccount({ status: 'out' });
    }
  })();
  return started;
}

export type Result = { ok: true } | { ok: false; message: string };

function failed(error: AuthErrorLike, sendsMail = false): Result {
  return { ok: false, message: authErrorMessage(error, sendsMail) };
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
    if (error) return failed(error, true);
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
    return error ? failed(error, true) : { ok: true };
  });
}

export function setNewPassword(password: string): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const { error } = await supabase.auth.updateUser({ password });
    return error ? failed(error) : { ok: true };
  });
}

/**
 * Account en alle online voortgang voorgoed verwijderen, en daarna ook niets
 * op deze computer achterlaten.
 */
export function deleteAccount(): Promise<Result> {
  return run(async () => {
    const supabase = await getClient();
    const current = sync;
    const unanswered = question !== null;
    // Eerst stoppen, anders zou bewaren de voortgang meteen weer online zetten.
    sync?.stop();
    sync = null;
    setQuestion(null);
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      if (current || unanswered) followAccount(supabase, account);
      return failed(error);
    }
    // Het account bestaat niet meer; dit ruimt alleen de inlog in de browser op.
    await supabase.auth.signOut({ scope: 'local' });
    if (!unanswered) forgetAccountData(syncStore());
    return { ok: true };
  });
}

export type SignOutResult = Result | { ok: false; unsaved: true; message: string };

/**
 * Uitloggen op deze computer (andere computers blijven ingelogd). Eerst wordt
 * de laatste voortgang online bewaard; lukt dat niet, dan vragen we het eerst
 * (force = toch uitloggen). Daarna blijft er van het account niets achter in
 * deze browser.
 */
export function signOut(force = false): Promise<SignOutResult> {
  return run<SignOutResult>(async () => {
    const supabase = await getClient();
    if (!force && sync && !(await sync.flush())) {
      return {
        ok: false,
        unsaved: true,
        message:
          'Je laatste voortgang is nog niet online bewaard, want er is geen verbinding. Als je nu uitlogt, ben je die kwijt.',
      };
    }
    // Nog niet geantwoord op de vraag over de voortgang van deze computer: dan is
    // wat er staat nog van de computer, niet van het account. Dat laten we staan.
    const unanswered = question !== null;
    sync?.stop();
    sync = null;
    setQuestion(null);
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    // Supabase haalt de inlog meestal ook bij een fout uit de browser; kijk wat er echt is.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      // Nog steeds ingelogd: gewoon verder bijhouden.
      followAccount(supabase, fromSession(data.session));
      return failed(error ?? {});
    }
    if (!unanswered) forgetAccountData(syncStore());
    return { ok: true };
  });
}
