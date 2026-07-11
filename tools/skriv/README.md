# skriv — the writing desk

A dependency-free local editor for this notebook. Write a note, watch the
**real site** render it live, press *publicera* and follow it all the way to
"live" on ferreirademelo.com.

```
npm run skriv     →  http://127.0.0.1:4499
```

It starts `astro dev` on :4321 automatically if it isn't already running.

## The model

- **The draft is just a file.** Saving writes the real markdown into
  `src/content/notes/<slug>.md` with `draft: true`. Drafts are visible in
  `astro dev` (so the preview works) and invisible in builds (so nothing
  leaks). No shadow database.
- **The preview is the real page.** The right pane is an iframe of the
  actual Astro dev server rendering your actual file — not a lookalike
  markdown renderer. What you see is what publishes.
- **Git is the publish boundary.** *Publicera* removes `draft: true`,
  commits **only that note's file and its image folder** (never `-A`),
  pushes to `main`, then follows the GitHub Actions run for that exact
  commit until the site is live — the button's contract is "it's live",
  not "it's pushed".

## The publish pipeline

Preflight (nothing is touched until all pass):
1. **validate** — frontmatter complete, body non-empty, slug matches file
2. **branch** — must be on `main`, told plainly if not
3. **fetch** — proves network + GitHub auth *before* any state changes

Then: flip draft off (republish bumps `revisions`) → `pull --rebase`
(auto-abort + restore on conflict) → scoped `git add` → commit
(`note: <title>`) → push → poll the Actions run → **live**, with the URL.

Every failure restores the draft state, never leaves a mid-rebase tree,
and says at most one command to run. The progress bar is a pen stroke
drawing across the header; on failure it stops where the pen stopped.

## Features

- Title/description/date/language/AI-declaration form — the form owns the
  frontmatter, so the file is always schema-valid
- Slug auto-derived from title (å→a, ö→o), editable until first publish,
  then locked (renaming a live note breaks its URL)
- Drop or paste an image into the text: it is saved to
  `public/blog/<YYMMDD>_<slug>/` and the correct path is inserted; the
  first image becomes the note's hero image
- Note list with honest state chips: `draft · utkast` / `edited` / `live`
- Bilingual chrome: switch the note to svenska and the editor follows
- Binds to 127.0.0.1. No auth, no daemon, no scheduler — you publish by
  clicking, that is the whole security and publishing model

## Deliberately not built

WYSIWYG/markdown toolbars (the iframe is the preview), scheduling (a
scheduler means a daemon), delete buttons next to publish buttons,
projects editing, remote access, conflict-resolution UI (one writer, one
machine; a conflicting rebase aborts cleanly and says so).

## Roadmap ideas

- Plot archive: thumbnails of plots nº 1…N-1 on /notes (derivable — plot k
  is a pure function of the first k notes)
- `tools:` declaration field in the form
- Per-note word-count sparkline while typing
