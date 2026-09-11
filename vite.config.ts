import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  base: './',
  define: {
    // Shim process.env so @sanity/client and other Node-style packages don't crash in the browser.
    'process.env': {},
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@wiki': resolve(__dirname, 'src/wiki'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});