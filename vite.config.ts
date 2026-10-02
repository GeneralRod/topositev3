import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { isSiteUpdate, MAJOR_PR, versionLabel } from './src/version';

/** Aantal updates sinds de laatste mijlpaal (zie src/version.ts); null als git niet lukt. */
function updatesSinceMilestone(): number | null {
  const run = (command: string) =>
    execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  const lines = (text: string) => text.split('\n').filter(Boolean);
  try {
    // Netlify haalt soms maar een deel van de geschiedenis op; dan eerst alles ophalen.
    if (run('git rev-parse --is-shallow-repository') === 'true')
      run('git fetch --unshallow --quiet');
    // Samengevoegde pull requests in main, nieuwste eerst: "<hash><tab><onderwerp>".
    const merges = lines(run('git log --merges --first-parent --format=%H%x09%s HEAD')).map(
      (line) => {
        const [hash, subject] = line.split('\t');
        return { hash, subject };
      },
    );
    const milestone = merges.findIndex((m) =>
      m.subject.startsWith(`Merge pull request #${MAJOR_PR} `),
    );
    if (milestone < 0) return null;
    // Nieuwste eerst: alles vóór de mijlpaal in deze lijst kwam erna.
    return merges
      .slice(0, milestone)
      .filter((m) => isSiteUpdate(lines(run(`git diff --name-only ${m.hash}~1 ${m.hash}`)))).length;
  } catch {
    return null;
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __SITE_VERSION__: JSON.stringify(versionLabel(updatesSinceMilestone())),
  },
  build: {
    // Twee bewust grote stukken die pas later geladen worden: three.js voor de
    // wereldbol (~540 kB) en de landenkaart van Natural Earth (~760 kB, 240 kB
    // ingepakt). De standaardwaarschuwing (500 kB) is daarom te streng.
    chunkSizeWarningLimit: 800,
  },
});
