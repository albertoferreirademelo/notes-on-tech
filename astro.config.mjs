// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://notesontech.example',
  markdown: {
    shikiConfig: {
      theme: 'poimandres',
    },
  },
});
