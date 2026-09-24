import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Twee bewust grote stukken die pas later geladen worden: three.js voor de
    // wereldbol (~540 kB) en de landenkaart van Natural Earth (~760 kB, 240 kB
    // ingepakt). De standaardwaarschuwing (500 kB) is daarom te streng.
    chunkSizeWarningLimit: 800,
  },
});
