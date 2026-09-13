import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        // Vite's builtin-module list doesn't yet include node:sqlite (added
        // recently to Node) — force it to stay external instead of being
        // (mis)resolved as a bare package import.
        external: [/^node:/],
      },
    },
  },
});
