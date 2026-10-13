import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

// Builds the site as plain files in dist/client for GitHub Pages
// (www.ferreirademelo.com). public/CNAME and public/.nojekyll ride along.
const site = new URL('../dist/client/', import.meta.url);
spawnSync('npx', ['vinext', 'build'], { stdio: 'inherit', shell: true });
// The exporter can trip a libuv assertion while exiting on Windows after the
// files are written, so judge the build by its output rather than exit code.
for (const page of ['index.html', 'games.html', '404.html', 'CNAME'])
  if (!existsSync(new URL(page, site))) {
    console.error(`Static export is incomplete: ${page} is missing.`);
    process.exit(1);
  }
// Build by-products that are not part of the site.
for (const extra of [
  '_headers',
  '.assetsignore',
  '.vite',
  'vinext-client-entry-manifest.json',
])
  rmSync(new URL(extra, site), { recursive: true, force: true });
console.log('Static site ready in dist/client');
