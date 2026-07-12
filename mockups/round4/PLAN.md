# PLAN.md — the composite homepage ("Urverk × Plotter × Deklaration")

Frozen spec for round 4. Method: grill-me-codex adapted — this plan is
reviewed by an independent adversarial agent (Act 2) before a separate
builder implements it (Act 3); the author does not grade their own build.

## Decisions (design lead, owner delegated "do what you think is best")

- **Direction:** the composite. Plotter v3 brand (type, hairlines, ink,
  no cards) is the base. Urverk's live instrument is the hero set-piece.
  Sol's page-level innehållsdeklaration goes in the footer; her per-note
  metadata chips go in the index rows. The strand plot is NOT on the
  homepage — it belongs on /arkiv where it grows with the archive.
- **Above the fold:** identity-first. Fixes the round-3 critique that
  Urverk was "an instrument demo with a byline." Reading order: name →
  profession → the live instrument as supporting evidence, not the lead.
- **Language:** Swedish names the furniture (Anteckningar, Arkiv, Just nu,
  Innehållsdeklaration); English carries the prose.
- **Contact:** GitHub only. No email on the page.

## Deliverable

A single self-contained `composite.html` (artifact format is fine for the
mockup) that is double-clickable offline, PLUS a `preview/` launcher folder
so the owner can browse all options on their PC. Real Astro wiring is a
follow-up, not part of this plan.

## Layout (desktop, top → bottom)

1. **Top bar** — mono wordmark `ferreirademelo.com` left; nav `index /
   arkiv / about` + theme toggle (◐) right; hairline under.
2. **Hero, one viewport, identity-first.** Two columns.
   - LEFT (~54%): eyebrow `ANTECKNINGAR`; name `Ferreira de Melo` (Bodoni,
     clamp 3–5.5rem, lh .95); **profession line, prominent** — "Data & design
     in public service — making AI transparent and genuinely useful."; a mono
     `JUST NU` readout: `STOCKHOLM HH:MM · SOL ±x.x°` / `SÃO PAULO HH:MM ·
     SOL ±x.x°`, live; a quiet toggle `visa beräkningen · show the working`.
   - RIGHT (~46%): the **Urverk dial**, sized to fit the viewport
     (~min(56vh, 40vw)), vertically centered. Reuse the round-3 Urverk
     canvas + NOAA math verbatim (it is correct and inspectable).
3. **Notes index** — begins by ~1.3 viewports. Label `Index — 1 note · 1
   language · 0 AI-written words`. Rows: mono date | serif title +
   description | **metadata chip line** (`111 ORD · AI: INGEN · ≈1 MIN`) +
   red lang tag. Hairlines between.
4. **About** — two-col (mono label | prose). Verbatim approved copy:
   "Alberto Ferreira de Melo works in public service, on data and design —
   mostly on making AI transparent and genuinely useful. From Brazil, based
   in Sweden." + "Every note ends with an innehållsdeklaration — a
   declaration of how it was made."
5. **Footer** — page-level **innehållsdeklaration** (Sol's idea, honest):
   `1 HTML-fil · externa anrop 0 · kakor 0 · spårare 0 · typsnitt: systemets
   egna · JavaScript: vanilj · AI: ja — i formgivningen, granskad av en
   människa`. Then `© 2026 Alberto Ferreira de Melo` + GitHub link. Hairline.

## Design system (unchanged brand)

Tokens light: paper #FBFAF6, ink/type #16324F, red #C33D1F, graphite
#7A776D, hairline #E3E1D9. Dark: #10151C / #C7D6EA / #E0563A / #8A93A3 /
#26303E / #EDF1F7. Both via `@media prefers-color-scheme` + `:root[data-theme]`
overrides; canvas re-renders on theme change. Bodoni/Didot/Georgia display;
Charter/Cambria/Georgia body; ui-monospace labels. No cards, no rounded
corners (dial excepted), no box shadows.

## Hard rules

- 100% self-contained: no CDNs, no webfonts, no remote images, no fetch.
- The instrument computes on-page (NOAA); the footer's "externa anrop 0"
  must be literally true — no network calls anywhere.
- **No fabricated data** (round-3 lesson from Sol's fake G-code): every
  number shown is either real content or genuinely computed on the page.
- prefers-reduced-motion: hand static at load, no animation, all visible.
- No horizontal scroll at 390px (hero stacks: masthead over dial).
- Visible focus states; every tag closed; both themes cared for.

## Explicit non-goals / refusals

- No strand plot on the homepage (moves to /arkiv, grows with notes).
- No time-spiral until ≥ 8 notes (collapses at n=1).
- No email published.
- No rebrand of the type system (Sol's grotesque masthead is rejected).

## Revision after Act 2 review (these OVERRIDE anything above)

1. **Source order is masthead-first.** `.masthead` (name → profession → JUST NU)
   comes BEFORE the dial in the DOM. Desktop grid keeps masthead in the left
   column purely by source order — no CSS `order`. Mobile therefore stacks
   name → profession → readout → dial, correctly.
2. **Mandated hero metrics (1440×900):** grid `54% / 46%`, column-gap 3rem;
   dial `min(56vh, 40vw)`, vertically centered; name `clamp(3rem, 4.4vw,
   4.6rem)`; profession `max-width: 32ch` and set as the visual lead — type
   `--type` colour, weight ~500, ~1.15rem (NOT muted italic caption). Hero
   `min-height: min(86vh, 850px)`. "Ferreira de Melo" must not wrap to 3 lines.
3. **Reduced-motion clock:** under RM, update the JUST NU readout + reposition
   the hand once every **60 s** (a clock is not animation); never run the
   per-second `drawDial()`. Full per-second redraw only when motion is allowed.
   The theme-change canvas redraw MUST fire even under RM (or the dark dial
   stays light).
4. **Footer AI line, exact text:** `AI: ja — i formgivningen · text: människa`.
   No "granskad av en människa".
5. **Real numbers only:** the note is **114 words**, read time **≈1 min**, lang
   **EN**, `ai: none`. Index label: `Index — 1 note · 1 language · 0 AI-written
   words`. Chip row: `114 ORD · AI: INGEN · ≈1 MIN`. Nothing invented.
6. **Robustness:** `overflow-x: hidden` on body; localStorage theme
   persistence; DST-aware time zones via `Intl` (`Europe/Stockholm`,
   `America/Sao_Paulo`) — not hardcoded July offsets. `arkiv` nav points to
   `#` for the mockup with a comment that it maps to /arkiv in the real site.

## Acceptance criteria (what the reviewer/verifier checks)

1. Identity (name + profession) is fully visible in the first viewport at
   1440×900, above or beside the dial — not below it.
2. The dial renders crisp (DPR-aware), both daylight bands legible, endpoint
   time labels not overlapping, in both themes.
3. Notes index reachable within 1.3 viewports of scroll.
4. Footer declaration present and literally true (grep the file: zero
   http/https/fetch/CDN references).
5. Zero JS console errors (shot.js reports them) at desktop, dark, 390px.
6. No horizontal overflow at 390px.
