import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { versionLabel } from './src/version';

/** Aantal pull requests dat in main is samengevoegd (null als git niet lukt). */
function mergedPullRequests(): number | null {
  const run = (command: string) =>
    execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  try {
    // Netlify haalt soms maar een deel van de geschiedenis op; dan eerst alles ophalen.
    if (run('git rev-parse --is-shallow-repository') === 'true')
      run('git fetch --unshallow --quiet');
    const count = Number(run('git rev-list --count --merges --first-parent HEAD'));
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __SITE_VERSION__: JSON.stringify(versionLabel(mergedPullRequests(), new Date())),
  },
  build: {
    // Twee bewust grote stukken die pas later geladen worden: three.js voor de
    // wereldbol (~540 kB) en de landenkaart van Natural Earth (~760 kB, 240 kB
    // ingepakt). De standaardwaarschuwing (500 kB) is daarom te streng.
    chunkSizeWarningLimit: 800,
  },
});
