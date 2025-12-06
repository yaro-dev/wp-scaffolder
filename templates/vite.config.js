import { defineConfig } from 'vite';
import liveReload from 'vite-plugin-live-reload';
import path from 'path';

export default defineConfig({
  plugins: [
    liveReload([__dirname + '/**/*.php']),
  ],
  root: '', // Raíz del tema
  base: process.env.NODE_ENV === 'development' ? '/' : '/dist/',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    manifest: true,
    target: 'es2018',
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'src/js/app.js'),
        style: path.resolve(__dirname, 'src/css/app.css')
      }
    }
  },
  server: {
    cors: true,
    strictPort: true,
    port: 3000,
    hmr: {
      host: 'localhost'
    }
  }
});