# CLAUDE.md — notes-on-tech (ferreirademelo.com)

Personal site and public notebook of Alberto Ferreira de Melo. Astro static site,
markdown content collections, GitHub Pages.

## Commands

- `npm run dev` — dev server on :4321
- `npm run build` — static build to `dist/`
- `npm run preview` — serve the built site
- `npm run skriv` — the writing desk (local note editor + one-click publish, see `tools/skriv/README.md`)

## Deployment (important)

- GitHub Pages serves the **`gh-pages` branch** with custom domain `www.ferreirademelo.com`.
- The ONLY publish path is the GitHub Actions workflow (`.github/workflows/deploy.yml`):
  push to `main` → build → deploy to `gh-pages`. There is deliberately no local deploy
  script — a local deploy would ship uncommitted drafts from the working tree.
- `public/CNAME` and `public/.nojekyll` are **required** — never delete them.
  Without `.nojekyll`, Jekyll strips `_astro/` and the live site loses all CSS/fonts.
- **Never push to `main` without the owner's explicit OK** — it updates the live site.
  Do feature work on `claude/*` branches.
- Notes with `draft: true` render in `astro dev` but are excluded from builds.

## Architecture

- `src/content/notes/` — markdown notes (the spine of the site). Frontmatter:
  `title`, `description`, `pubDate` (YYYY-MM-DD), `slug`, `lang` ("en" | "sv"), `image` (optional).
- `src/content/projects/` — feeds the dateless "workbench" strip only. Projects are
  deliberately demoted: no dates, no cards, no dedicated pages.
- `src/layouts/PersonalLayout.astro` — top bar, theme toggle, footer. All pages use it.
- `src/styles/theme.css` — the **Plotter design system**: paper, hairlines, two inks
  (`--line`, `--pen2`), Bodoni Moda display + Charter body + mono labels.
  **No cards, no rounded corners, no box shadows.** Light + dark via tokens;
  the theme toggle stamps `data-theme` and must win over `prefers-color-scheme`.
- Homepage canvas: a generative flow-field "pen plot" that draws around the masthead
  (exclusion zone). Respect `prefers-reduced-motion` — render the finished plot statically.

## Conventions

- Language: site chrome may mix Swedish/English deliberately (mono labels like "Arkiv");
  notes are written in either language, tagged with `lang`.
- Copy voice: professional but not dry. No cutesy filler, no self-deprecating jokes,
  no "Sweden is home / Brazil is the other" sentimentality in page chrome (fine inside notes).
- Dates render ISO (`YYYY-MM-DD`), tabular numerals.
- Self-contained: no CDNs, no external fonts/scripts. Fonts are self-hosted via npm.
- Design mockups live in `mockups/` — history, not served.

## Verification

Before committing UI changes: `npm run build`, serve, and screenshot at 1440×900 and
390×844 in both themes (Playwright + Chromium are available in the remote env).
Check the theme toggle, reduced motion, and that no horizontal scroll appears at 390px.
