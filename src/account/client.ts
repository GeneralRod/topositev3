// De verbinding met Supabase. De bibliotheek wordt pas geladen als iemand het
// accountscherm opent of al ingelogd is; wie zonder account oefent, laadt hem
// nooit.

import type { SupabaseClient } from '@supabase/supabase-js';
import { SESSION_KEY, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';

let client: Promise<SupabaseClient> | null = null;

export function getClient(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js')
    .then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storageKey: SESSION_KEY,
          persistSession: true,
          autoRefreshToken: true,
          // Links uit de mails (bevestigen, nieuw wachtwoord) loggen je meteen in.
          detectSessionInUrl: true,
        },
      }),
    )
    .catch((error: unknown) => {
      // Laden mislukt (bijv. geen internet): de volgende keer opnieuw proberen.
      client = null;
      throw error;
    });
  return client;
}
