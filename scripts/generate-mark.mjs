import { writeFileSync } from 'node:fs';
import { BEAK_COLOR, WINGED } from '../app/mark-paths.ts';

// Run with Node 22.13+ to keep the favicon consistent with the header mark.
writeFileSync(
  new URL('../public/favicon.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -5 76 76"><defs><clipPath id="tip"><rect x="0" y="36" width="11.5" height="12"/></clipPath></defs><rect x="-6" y="-5" width="76" height="76" rx="17" fill="#050c10"/><path d="${WINGED}" fill="#c2e7cb"/><path d="${WINGED}" fill="${BEAK_COLOR}" clip-path="url(#tip)"/></svg>\n`,
);
