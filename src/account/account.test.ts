import { describe, expect, it } from 'vitest';
import { TEST_FLAG_KEY } from './config';
import { readAccountFlag } from './flag';
import {
  authErrorMessage,
  linkErrorMessage,
  OFFLINE_MESSAGE,
  passwordProblem,
  UNKNOWN_MESSAGE,
} from './messages';

function fakeStore(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

describe('accountknop (in aanbouw)', () => {
  it('is verborgen zonder ?account', () => {
    expect(readAccountFlag('', fakeStore())).toBe(false);
    expect(readAccountFlag('?modus=meerkeuze', fakeStore())).toBe(false);
  });

  it('gaat aan met ?account en blijft dan aan in deze browser', () => {
    const store = fakeStore();
    expect(readAccountFlag('?account', store)).toBe(true);
    expect(store.map.get(TEST_FLAG_KEY)).toBe('1');
    expect(readAccountFlag('', store)).toBe(true);
  });

  it('gaat weer uit met ?account=uit', () => {
    const store = fakeStore({ [TEST_FLAG_KEY]: '1' });
    expect(readAccountFlag('?account=uit', store)).toBe(false);
    expect(readAccountFlag('', store)).toBe(false);
  });
});

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
