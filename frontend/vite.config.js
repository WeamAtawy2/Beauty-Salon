import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(process.cwd(), 'frontend'),
  publicDir: resolve(process.cwd(), 'public'),
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, proxy: { '/api': 'http://localhost:4000' } },
  build: { outDir: resolve(process.cwd(), 'dist'), emptyOutDir: true },
});
