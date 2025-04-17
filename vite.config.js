import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isBasic = process.env.npm_lifecycle_script?.includes('start:basic');
  const baseUrl = mode === 'production' ? '/front_5th_chapter2-1/' : '/';

  return {
    plugins: isBasic ? [] : [react()],
    base: baseUrl,
    server: {
      open: true,
    },
    build: {
      rollupOptions: {
        input: {
          'index.basic': resolve(__dirname, 'index.basic.html'),
          'index.advanced': resolve(__dirname, 'index.advanced.html'),
        },
      },
      outDir: 'dist',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/setupTests.js',
    },
  };
});
