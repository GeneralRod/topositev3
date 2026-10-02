// Instellingen van de accounts (Supabase-project 'topografiewereld', Frankfurt).
// De sleutel hieronder is bedoeld om openbaar in de site te staan: de database
// laat iedereen alleen zijn eigen voortgang lezen en schrijven (zie
// supabase/migrations).

export const SUPABASE_URL = 'https://xjzapefnqfmwudchwvhl.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nD8oY_s-7axrojkcrQJMVg_HdAzh5aC';

/** Onder deze sleutel bewaart de browser dat je ingelogd bent. */
export const SESSION_KEY = 'topografiewereld_account';

export const MIN_PASSWORD_LENGTH = 8;

// Voor de privacyverklaring (/privacy).
export const PRIVACY = {
  /** Wie verantwoordelijk is voor de gegevens. */
  controller: 'Topografiewereld (Roderick Hage)',
  /** Contactadres voor vragen en verzoeken. */
  contact: 'topografiewereld@gmail.com',
  /** Wie de mails verstuurt (via Supabase, zie supabase/README.md). */
  mailService: 'Brevo (een Frans bedrijf, ook in de Europese Unie)',
  updated: '1 oktober 2026',
};
