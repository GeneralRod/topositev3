// De voortgang in de database van Supabase (tabel progress, zie
// supabase/migrations). Elke speler heeft één rij; de database laat alleen je
// eigen rij zien.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { SaveData } from '../storage';
import type { Backend, RemoteRow } from './sync';

/** Postgres-foutcode: de rij bestaat al. */
const UNIQUE_VIOLATION = '23505';

export function supabaseBackend(supabase: SupabaseClient, userId: string): Backend {
  const table = () => supabase.from('progress');
  return {
    async fetch() {
      const { data, error } = await table()
        .select('data, revision')
        .eq('user_id', userId)
        .maybeSingle<RemoteRow>();
      if (error) throw error;
      return data;
    },
    async update(save: SaveData, revision: number) {
      const { data, error } = await table()
        .update({ data: save })
        .eq('user_id', userId)
        .eq('revision', revision)
        .select('revision');
      if (error) throw error;
      const rows = data as { revision: number }[];
      return rows.length > 0 ? rows[0].revision : null;
    },
    async insert(save: SaveData) {
      const { data, error } = await table()
        .insert({ user_id: userId, data: save })
        .select('revision')
        .single<{ revision: number }>();
      if (error) {
        if (error.code === UNIQUE_VIOLATION) return null;
        throw error;
      }
      return data.revision;
    },
  };
}
