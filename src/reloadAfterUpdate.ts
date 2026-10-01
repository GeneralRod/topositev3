// Na een nieuwe versie van de site kan een tabblad dat al open stond nog een oud
// onderdeel zoeken (bijv. het spelscherm) dat niet meer bestaat. Dan laadt de site
// zichzelf één keer opnieuw, zodat het kind gewoon verder kan. De voortgang staat in
// de browser en blijft bewaard.

const KEY = 'topografiewereld_herladen';
/** Niet blijven herladen als het echt stuk is: hooguit één keer per minuut. */
const MIN_INTERVAL = 60_000;

export interface ReloadDeps {
  now: () => number;
  load: () => string | null;
  save: (value: string) => void;
  reload: () => void;
}

/** Herlaad als dat niet net al gebeurd is. Geeft terug of er herladen wordt. */
export function reloadOnce({ now, load, save, reload }: ReloadDeps): boolean {
  const last = Number(load() ?? 0);
  if (now() - last < MIN_INTERVAL) return false;
  save(String(now()));
  reload();
  return true;
}

export function listenForStaleVersion(): void {
  window.addEventListener('vite:preloadError', (event) => {
    const reloading = reloadOnce({
      now: () => Date.now(),
      load: () => {
        try {
          return sessionStorage.getItem(KEY);
        } catch {
          return null;
        }
      },
      save: (value) => {
        try {
          sessionStorage.setItem(KEY, value);
        } catch {
          // Geen opslag: dan toch herladen (hooguit één keer, de pagina begint opnieuw).
        }
      },
      reload: () => window.location.reload(),
    });
    // Bij herladen geen foutmelding tonen; anders gewoon de fout laten zien.
    if (reloading) event.preventDefault();
  });
}
