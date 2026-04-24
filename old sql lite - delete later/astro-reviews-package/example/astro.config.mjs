import { defineConfig } from 'astro/config';

export default defineConfig({
  root: '.',
  outDir: './dist',
  vite: {
    ssr: {
      external: ['better-sqlite3'],
    },
    optimizeDeps: {
      exclude: ['better-sqlite3'],
    },
  },
});
