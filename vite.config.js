import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: true
  },
  resolve: {
    alias: [
      {
        find: '@agents',
        replacement: resolve(__dirname, 'src/shared/agents')
      }
    ]
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
