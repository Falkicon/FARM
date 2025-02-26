import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: [],
    include: ['src/**/*.{spec,test}.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    setupFilePatterns: [
      {
        pattern: 'src/shared/llm/__tests__/**/*.{spec,test}.ts',
        setupFiles: ['src/shared/llm/__tests__/setup.ts']
      },
      {
        pattern: 'src/shared/theme/__tests__/**/*.{spec,test}.ts',
        setupFiles: ['src/shared/theme/__tests__/setup.ts']
      }
    ]
  }
});
