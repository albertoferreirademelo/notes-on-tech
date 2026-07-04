# ferreirademelo.com

Personal site and digital notebook of **Alberto Ferreira de Melo**

---

## 🪶 About

This site is built to hold ideas in progress — the things that sit between “thinking” and “making.”  
It’s a mix of notes, small experiments, and occasional essays.

- **Framework:** [Astro](https://astro.build)
- **Design:** "Plotter" — a generative pen-plotter draws a unique flow-field artwork on every visit; the rest is paper, hairlines, two inks and type. Light + dark, with a theme toggle.
- **Content:** Markdown files powered by [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/). Notes are the spine; projects live as a dateless "workbench" strip, on purpose.
- **Archive:** `/notes` shows every note on a timeline (one tick per note) with year-by-year sections.
- **Hosting:** GitHub Pages → soon moving to [ferreirademelo.com](https://ferreirademelo.com)

---

## 📂 Structure

```bash
/
├── src/
│   ├── content/
│   │   ├── notes/        # markdown posts (the spine of the site)
│   │   └── projects/     # feeds the dateless workbench strip
│   ├── layouts/          # PersonalLayout: top bar, theme toggle, footer
│   ├── pages/            # index (plot hero), notes (timeline archive), about
│   └── styles/           # theme.css — the plotter design system
└── public/
    └── blog/             # images and other static assets
