import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';

const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(() => {
  const isBasic = process.env.npm_lifecycle_script?.includes('start:basic');

  return {
    plugins: isBasic ? [] : [react()],
    server: {
      open: true,
    },
    build: {
      rollupOptions: {
        input: {
          main: isBasic ? resolve(__dirname, 'index.basic.html') : resolve(__dirname, 'index.html'),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/setupTests.js',
    },
  };
});
