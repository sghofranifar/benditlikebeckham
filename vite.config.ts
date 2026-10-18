import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Source entry is dev.html (open http://localhost:5173/dev.html while developing).
// The build produces ONE self-contained file, which scripts/publish.mjs copies to
// ./index.html and ./docs/index.html so GitHub Pages works from "/ (root)" or "/docs".
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: { outDir: 'build', rollupOptions: { input: 'dev.html' } },
});
