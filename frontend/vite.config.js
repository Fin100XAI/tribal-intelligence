import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend-only dashboard — all data is generated in the browser, no backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
