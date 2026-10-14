# Alberto — It starts with a question

A personal website for Alberto Ferreira de Melo Filho about curiosity, small experiments, and what they teach. Built with React, Vinext, and an original WebGL aurora. The opening follows the flow of a launch page: one luminous object in the centre with the name split to either side; as it is scrolled the name parts, the curtains turn from upright to edge-on, and a single statement takes their place. At the footer the same flat line returns from below and stands upright again above the closing question.

The mark is a left-facing bird whose breast flows into an anvil, drawn with tapered pen-like lines. `app/anvil-bird-paths.ts` holds the approved path data; `AnvilBirdMark` in `app/mark.tsx` displays it in warm ivory. A CSS container query uses the refined drawing at a displayed width of 64px or above, and the heavier compact drawing below 64px. The header is 64px on desktop and 48px on phones. Earlier logo variants are retained in `app/mark.tsx` and `app/mark-paths.ts`.

## Development

Run `npm install` and `npm run dev`. `npm run build` writes the finished site to `dist/client`. Type checking: `npx tsc --noEmit`. Lint: `npm run lint`. Tests: `npm test`.

`npm test` checks that the opening never stalls or overshoots while scrolled, continuity at every handoff, the upward exit and upward arrival, that the closing curtain clears the footer text on desktop, laptop, ultrawide, and phone viewports, pose bounds, and mesh indices. Requires Node 22.13+.

`node --experimental-strip-types scripts/generate-mark.mjs` regenerates the compact favicon and the transparent, text-free `public/assets/anvil-bird-refined.svg` and `public/assets/anvil-bird-compact.svg` exports from the approved path data after mark changes.

In development only, `/?qa=1` exposes controls for actual WebGL context loss/restoration and the reduced-motion rendering path. These controls are excluded from production. The canvas exposes sampled render count, light opacity, quality level, measured frame interval, and whether high dynamic range is in use (`data-range`) as DOM data attributes for read-only inspection.

## Design and behavior

- `app/page.tsx`: the opening, a short statement of approach, two verified historical projects, a silent light-sensor illustration, original circuit disclosure, and external contact links. It also drives the opening's text handoff (name → statement) from scroll, so that works without WebGL.
- `app/games/`: the Games page at `/games`, linked from the header. `games.ts` is the list: each game is one entry (title, tagline, description, thumbnail, screenshots, play and source links, tags) and `page.tsx` renders a `game-card.tsx` per entry. The whole card opens the game in a new tab (never an iframe, since games may enter VR), with the source link and a screenshot disclosure layered above it. Screenshots live in `public/assets/`. The page is static: no WebGL, only a still gradient.
- `app/site-header.tsx`: the header shared by both pages. Section links are in-page anchors on the home page and lead back to it from elsewhere.
- `app/aurora.tsx`: layered curtains with dark gaps, diffuse upper veils, and perspective rotation. The look is modelled on Alberto's own aurora photographs: broad, soft rays of differing width rather than fine lines; a soft bright lower border with glowing knots rather than an outline; light that fades upward for a long way without ending; a clean green with only a faint magenta haze at the tops and under the border. Most of the curtain is a tall, very faint wash; the strong light is where that wash gathers. A slow field draws the light toward a few places along the curtain, crowding the rays together and brightening them there while thinning them between, then lets go. Nothing in it is a ruled line: each ray swells and fades along its own height, rays melt into the glow wherever the curtain is seen so obliquely that they would be squeezed into thin stripes, each strip's brightness is scaled by how squarely it faces the viewer so oblique strips never pile their light into a bright line, and the light is drawn at 70% of screen resolution and smoothed on the way up, like a long exposure (stars stay sharp). Surges of brightness travel along the curtain and the rays shimmer and slide. Scroll speed pulls a lightly damped spring that leaves the upper curtain trailing and then settling. On a fresh load at the top of the page the curtain unfurls upward from a line. The folds are fractal noise layered on slow waves, so the shape never repeats. All shader noise uses sine-free hashes: `sin()` is imprecise on many phone GPUs, and a `fract(sin(x) * 43758.5)` hash turns that error into hard seams between noise cells that never show on a desktop. Colour comes from emission by altitude, summed as light: oxygen green through the body, a faint oxygen red high up, and nitrogen violet-pink under the border where the display is most energetic. Where the device supports it the light accumulates in half-float targets (falling back to 8-bit), so overlapping light never clips a channel and shifts hue, and tone mapping works on brightness so strong light stays green instead of bleaching. A tight bloom plus a much wider haze give it atmosphere; stars twinkle, drift slightly with scroll, and dim behind the light. Geometry has 16,454 vertices / 31,104 triangles.
- `app/aurora-scene.ts`: reversible scroll choreography. The opening is a monotone cubic through its poses, so the light keeps moving for as long as the page is scrolled; after the pin releases the light travels with the page at a fraction of its speed, like something distant. The finale is sized and positioned from the measured footer layout.
- `app/globals.css`: responsive editorial layout, fixed navigation that dissolves downward instead of cutting the light, stable pinned opening, a footer whose upper part is left open as sky, and reduced-motion styles.

Tailwind is used only for its CSS reset, and scans only `app/`; every style the site uses is written out in `app/globals.css`.

Rendering is capped near 60 fps, lowers its resolution after sustained slow frames, stops while hidden, and becomes idle when paused or while the light is out of view between the opening and the finale. Pause freezes ambient motion while scroll remains directly scrubbable. On narrow screens the edge-on horizon tips back toward the viewer and brightens, so it stays a band of light rather than a thread. Reduced motion uses a short, unpinned opening and two static poses (the opening curtain and the closing one). Context loss reveals the SVG artwork without changing page dimensions; restoration rebuilds GPU resources. The site also works without WebGL. No audio, tracking, or contact-form backend is included.

## Content provenance

The prose is a new editorial draft based on these public materials; it does not claim new achievements or current project results:

- [Public about page](https://www.ferreirademelo.com/about/): Brazil/Sweden, data/design/public service, photography, electronics, 3D printing, and coffee.
- [Public GitHub profile README](https://github.com/albertoferreirademelo/albertoferreirademelo): studies in bioinformatics and economics; verified LinkedIn destination.
- [Arduino/Python experiment](https://github.com/albertoferreirademelo/12-Playing-arduino-with-Python): university light-triggered music project. `public/assets/arduino.png` is its original breadboard illustration, downloaded unchanged from `arduino.png` in that repository.
- [Swedish stock-market thesis](https://github.com/albertoferreirademelo/19-DNN-LSTM-SwedishStockMarket): bachelor's thesis, LSTM experiments, and the author's stated overfitting concern. `public/assets/market-study.png` is the unchanged archived `Pictures/1- All Stocks/XOMX30_AdjClose.png`, an input-data plot, not a prediction-performance claim.

The visual reference was [the Astra launch page](https://openai.com/index/gpt-6-astra/). The aurora, identity, layout, and interaction are original code, not extracted reference assets.

## Publishing

The live site is `www.ferreirademelo.com`, served by GitHub Pages from the `gh-pages` branch of `albertoferreirademelo/notes-on-tech`.

`npm run build` writes the whole site as plain files to `dist/client` (`index.html`, `games.html`, `404.html`, assets, plus `CNAME` and `.nojekyll` from `public/`). Publishing is replacing the contents of the `gh-pages` branch with that folder. Because the site ships as static files, links between pages are plain anchors rather than `next/link`, whose client-side navigation does not work in the export.

The site that was live before this one is kept at the tag `live-before-aurora-2026-10-13` in that repository.

The site is plain files with nothing running behind them, and it is kept that way on purpose:

- Dependencies are only React, the framework (vinext on Vite), and Tailwind's reset. Images are ordinary `<img>` tags and page links ordinary `<a>` tags, which is why the lint rules `nextjs/no-img-element` and `nextjs/no-html-link-for-pages` are turned off.
- Every page declares a Content-Security-Policy (in `app/layout.tsx`, since GitHub Pages cannot send headers): the site loads scripts, styles, fonts and images only from itself, makes no requests elsewhere, and cannot submit forms. Fonts are downloaded at build time and served from the site.
- No analytics, cookies, forms, or third-party embeds. Outbound links open with `noopener noreferrer`.

## Validation of this revision

Browser review covered 1440×900 desktop and 375×812 phone compositions (1366×650 laptop for the footer), the tall/flat/horizon/finale poses and the transitions between them, navigation anchors, reduced-motion layout, and graphics loss/recovery. No page-height change occurred on context loss/restoration. The observed desktop browser frame interval was about 16.7 ms after capping; this is a local browser observation, not a benchmark on a physical phone.

Type checking, the eight geometry/choreography tests, lint across the whole repository, and the build pass.
