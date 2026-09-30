// Foutmeldingen van Supabase in gewone Nederlandse taal. Pure functies, getest
// in messages.test.ts.

import { MIN_PASSWORD_LENGTH } from './config';

export interface AuthErrorLike {
  code?: string;
  status?: number;
  name?: string;
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Dit e-mailadres of wachtwoord klopt niet.',
  email_not_confirmed:
    'Je e-mailadres is nog niet bevestigd. Kijk in je mail (ook bij ongewenst) en klik op de link.',
  weak_password: `Kies een langer wachtwoord, van minstens ${MIN_PASSWORD_LENGTH} tekens.`,
  same_password: 'Dit is al je wachtwoord. Kies een ander wachtwoord.',
  email_address_invalid: 'Dit e-mailadres klopt niet. Kijk even of je het goed hebt getypt.',
  validation_failed: 'Dit e-mailadres klopt niet. Kijk even of je het goed hebt getypt.',
  email_exists: 'Er is al een account met dit e-mailadres. Log in of kies "Wachtwoord vergeten".',
  user_already_exists:
    'Er is al een account met dit e-mailadres. Log in of kies "Wachtwoord vergeten".',
  over_email_send_rate_limit: 'Er zijn net te veel mails verstuurd. Wacht een paar minuten.',
  over_request_rate_limit:
    'Even te vaak geprobeerd. Wacht een paar minuten en probeer het opnieuw.',
  email_address_not_authorized:
    'Mailen naar dit adres lukt nog niet: de accounts zijn nog in aanbouw.',
  signup_disabled: 'Nieuwe accounts maken kan nu even niet.',
  user_banned: 'Dit account is geblokkeerd.',
  session_not_found: 'Je bent niet meer ingelogd. Log opnieuw in.',
  session_expired: 'Je bent niet meer ingelogd. Log opnieuw in.',
  otp_expired: 'Deze link is verlopen of al gebruikt. Vraag een nieuwe aan.',
};

export const OFFLINE_MESSAGE = 'Geen verbinding met internet. Probeer het straks nog eens.';
export const UNKNOWN_MESSAGE = 'Er ging iets mis. Probeer het straks nog eens.';

export function authErrorMessage(error: AuthErrorLike): string {
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  // Geen antwoord van de server: meestal geen internet.
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) return OFFLINE_MESSAGE;
  if (error.status === 429) return MESSAGES.over_request_rate_limit;
  return UNKNOWN_MESSAGE;
}

/**
 * Kwam je binnen via een link uit een mail die niet meer werkt? Supabase zet
 * de fout dan achter # in de url (bijv. #error_code=otp_expired).
 */
export function linkErrorMessage(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('error_code');
  if (!code && !params.get('error')) return null;
  return code && code !== 'otp_expired' ? authErrorMessage({ code }) : MESSAGES.otp_expired;
}

/** Controle vooraf, zodat een kind meteen ziet wat er mis is. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Je wachtwoord moet minstens ${MIN_PASSWORD_LENGTH} tekens lang zijn.`;
  }
  return null;
}
