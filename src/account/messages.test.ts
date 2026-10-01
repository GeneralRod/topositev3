import { describe, expect, it } from 'vitest';
import {
  authErrorMessage,
  linkErrorMessage,
  OFFLINE_MESSAGE,
  passwordProblem,
  UNKNOWN_MESSAGE,
} from './messages';

describe('foutmeldingen', () => {
  it('vertaalt bekende fouten van Supabase', () => {
    expect(authErrorMessage({ code: 'invalid_credentials', status: 400 })).toBe(
      'Dit e-mailadres of wachtwoord klopt niet.',
    );
    expect(authErrorMessage({ code: 'weak_password' })).toContain('minstens 8 tekens');
  });

  it('herkent geen internet', () => {
    expect(authErrorMessage({ name: 'AuthRetryableFetchError', status: 0 })).toBe(OFFLINE_MESSAGE);
  });

  it('herkent te vaak proberen, ook zonder code', () => {
    expect(authErrorMessage({ status: 429 })).toContain('te vaak');
  });

  it('geeft een algemene melding voor onbekende fouten', () => {
    expect(authErrorMessage({ code: 'iets_nieuws', status: 500 })).toBe(UNKNOWN_MESSAGE);
    expect(authErrorMessage({})).toBe(UNKNOWN_MESSAGE);
  });
});

describe('links uit mails', () => {
  it('ziet niets als er geen fout in de url staat', () => {
    expect(linkErrorMessage('')).toBeNull();
    expect(linkErrorMessage('#access_token=abc&type=signup')).toBeNull();
  });

  it('meldt een verlopen of gebruikte link', () => {
    expect(
      linkErrorMessage('#error=access_denied&error_code=otp_expired&error_description=x'),
    ).toContain('verlopen');
    expect(linkErrorMessage('#error=access_denied')).toContain('verlopen');
  });
});

describe('wachtwoord', () => {
  it('moet minstens 8 tekens hebben', () => {
    expect(passwordProblem('kort')).toContain('minstens 8');
    expect(passwordProblem('lang genoeg')).toBeNull();
  });
});
