// Beheerfuncties in de database (supabase/migrations/20261002090000_beheer.sql).
// De database controleert zelf of je beheerder bent; deze code vraagt het alleen.

import { useEffect, useState } from 'react';
import { getClient } from '../account/client';
import { useAccount } from '../account/session';
import { emptySaveData, parseSaveData, type SaveData } from '../storage/storage';

export interface Player {
  userId: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
  coins: number;
  prizes: number;
  stars: number;
  updatedAt: string | null;
}

export interface PlayerProgress {
  email: string;
  data: SaveData;
  /** null = de speler heeft nog geen voortgang online. */
  revision: number | null;
}

export interface LogEntry {
  at: string;
  email: string | null;
  reason: string | null;
  before: SaveData | null;
  after: SaveData | null;
}

/** Zegt de database dat de ingelogde speler beheerder is? null = nog aan het vragen. */
export function useIsAdmin(): boolean | null {
  const account = useAccount();
  const userId = account.status === 'in' ? account.userId : null;
  const [answer, setAnswer] = useState<{ userId: string; admin: boolean } | null>(null);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void getClient()
      .then((supabase) => supabase.rpc('is_admin'))
      .then(({ data }) => !cancelled && setAnswer({ userId, admin: data === true }))
      .catch(() => !cancelled && setAnswer({ userId, admin: false }));
    return () => {
      cancelled = true;
    };
  }, [userId]);
  if (!userId) return account.status === 'loading' ? null : false;
  return answer?.userId === userId ? answer.admin : null;
}

async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const supabase = await getClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export async function listPlayers(): Promise<Player[]> {
  const rows = await call<Record<string, unknown>[]>('admin_list_players');
  return rows.map((row) => ({
    userId: String(row.user_id),
    email: String(row.email ?? ''),
    createdAt: String(row.created_at),
    lastSignInAt: (row.last_sign_in_at as string | null) ?? null,
    confirmed: row.confirmed === true,
    coins: Number(row.coins ?? 0),
    prizes: Number(row.prizes ?? 0),
    stars: Number(row.stars ?? 0),
    updatedAt: (row.updated_at as string | null) ?? null,
  }));
}

export async function getProgress(userId: string): Promise<PlayerProgress> {
  const row = await call<{ email: string; data: unknown; revision: number | null }>(
    'admin_get_progress',
    { player: userId },
  );
  return {
    email: row.email,
    data: parseSaveData(row.data) ?? emptySaveData(),
    revision: row.revision ?? null,
  };
}

export function saveProgress(
  userId: string,
  data: SaveData,
  expectedRevision: number | null,
  reason: string,
): Promise<number> {
  return call<number>('admin_save_progress', {
    player: userId,
    new_data: data,
    expected_revision: expectedRevision,
    reason,
  });
}

export async function recentLog(): Promise<LogEntry[]> {
  const rows = await call<Record<string, unknown>[]>('admin_recent_log');
  return rows.map((row) => ({
    at: String(row.at),
    email: (row.email as string | null) ?? null,
    reason: (row.reason as string | null) ?? null,
    before: parseSaveData(row.before),
    after: parseSaveData(row.after),
  }));
}
