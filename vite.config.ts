import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // three.js (de wereldbol) is los ~540 kB. Dat stukje wordt pas na het
    // tonen van de startpagina geladen, dus de standaardwaarschuwing (500 kB)
    // is hier niet van toepassing.
    chunkSizeWarningLimit: 600,
  },
});
