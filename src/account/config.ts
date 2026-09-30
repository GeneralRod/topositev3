// Instellingen van de accounts (Supabase-project 'topografiewereld', Frankfurt).
// De sleutel hieronder is bedoeld om openbaar in de site te staan: de database
// laat iedereen alleen zijn eigen voortgang lezen en schrijven (zie
// supabase/migrations).

export const SUPABASE_URL = 'https://xjzapefnqfmwudchwvhl.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nD8oY_s-7axrojkcrQJMVg_HdAzh5aC';

/** Onder deze sleutel bewaart de browser dat je ingelogd bent. */
export const SESSION_KEY = 'topografiewereld_account';

/** Zolang accounts in aanbouw zijn: onthoudt dat de accountknop getoond mag worden. */
export const TEST_FLAG_KEY = 'topografiewereld_account_test';

export const MIN_PASSWORD_LENGTH = 8;
