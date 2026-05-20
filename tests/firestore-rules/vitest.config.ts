import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/firestore-rules/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
