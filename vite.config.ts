import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds ONE self-contained index.html (no server needed) — open it offline on any iPad or laptop.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
});
