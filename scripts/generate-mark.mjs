import { writeFileSync } from 'node:fs';
import {
  ANVIL_BIRD_COMPACT_STROKE,
  ANVIL_BIRD_INK,
  ANVIL_BIRD_PATHS,
  ANVIL_BIRD_VIEWBOX,
} from '../app/anvil-bird-paths.ts';

const paths = ANVIL_BIRD_PATHS.map((path) => `<path d="${path}"/>`).join('');
const compact = `stroke="currentColor" stroke-width="${ANVIL_BIRD_COMPACT_STROKE}" stroke-linejoin="round"`;

// Standalone, transparent exports contain no lettering. The website's inline
// emblem and its favicon use the same approved path data.
for (const [name, stroke] of [
  ['refined', 'stroke="none"'],
  ['compact', compact],
]) {
  writeFileSync(
    new URL(`../public/assets/anvil-bird-${name}.svg`, import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ANVIL_BIRD_VIEWBOX}" width="252" height="162" color="#262523" role="img" aria-label="Bird and anvil emblem"><g fill="currentColor" ${stroke}>${paths}</g></svg>\n`,
  );
}

// Run with Node 22.13+ to keep the favicon consistent with the header mark.
writeFileSync(
  new URL('../public/favicon.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#050c10"/><g color="${ANVIL_BIRD_INK}" fill="currentColor" ${compact} transform="translate(2 12.7) scale(.2380952381) translate(-28 -16)">${paths}</g></svg>\n`,
);
