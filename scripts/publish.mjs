import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

// Copy the single-file build to the places GitHub Pages can serve from.
mkdirSync('docs', { recursive: true });
copyFileSync('build/dev.html', 'index.html');
copyFileSync('build/dev.html', 'docs/index.html');
writeFileSync('.nojekyll', '');
writeFileSync('docs/.nojekyll', '');
console.log('Published to ./index.html and ./docs/index.html');
