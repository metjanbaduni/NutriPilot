/**
 * Vite config for NutriPilot.
 * - Enables the React plugin for JSX and Fast Refresh.
 * - Defines the "@" alias to resolve to ./src for imports like "@/components/Button".
 * - Runs the dev server on port 5173 and opens the browser automatically.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcssConfig from './postcss.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map "@" to ./src for absolute imports like "@/components/Button".
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: postcssConfig
  },
  server: {
    port: 5173,
    open: true
  }
});
