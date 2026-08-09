# Emericfolio

Portfolio of **Emeric Ressy**, a 3D motion designer and art director based in
Paris. Projects are shown in an interactive 3D hub, with an automatic light mode
for machines that cannot run the scene.

Next.js 16 (App Router, React 19), react-three-fiber, Tailwind 4.

```bash
npm install
npm run dev      # http://localhost:3000
```

---

## Content never lives in the code

Everything on screen comes from the `content/` folder. No text, no image and no
project is hard-coded in `src/`.

```
content/
├── site.yml                    ← every text on the site
└── projets/
    ├── 01_gentle-mates/        ← one folder = one project
    ├── 02_dofus/
    ├── 03_douce-melancolie/
    └── 04_come-torment/
```

One command turns that folder into the site:

```bash
npm run contenu
```

It checks the files, shrinks the images and rewrites the data the site reads.
**Nothing is published while an error remains**, and the message names the file,
the line and what to fix.

During development, `npm run dev` watches `content/` and picks up every change on
the fly. Nothing to restart.

---

## Adding a project

**1. Duplicate a folder** in `content/projets/` and rename it with the next
number:

```
content/projets/05_my-project/
```

The number sets the position on the site. The name after the `_` is used as an
address: lowercase letters, digits and dashes only. Two projects cannot share the
same name.

**2. Fill in** `projet.yml`:

```yaml
title: Full project title
shortTitle: Short title           # shown on the 3D card
year: 2026
tag: Client · Type
accent: "#FF2D9C"                 # accent colour, quotes included
vimeoId: 1234567890               # the number at the end of the Vimeo URL
role: Art direction · 3D motion
kind: personal                    # personal or client

blurb: >
  A one-sentence summary.

description: >
  The long text describing the project.

credits:
  Univers: Brand name
  Direction artistique: Emeric Ressy
```

Field names are in English, values are whatever should appear on screen.

**3. Drop the media** into the folder, one directory per section:

```
05_my-project/
├── projet.yml
├── poster.png              ← cover image, any size
├── motion/
├── stillframes/
├── storyboard/
├── behind-the-scene/
└── scraps-and-research/
```

These five names are the only ones recognised, and a missing section simply is
not rendered. Files can be full resolution: they are resized and compressed
automatically, and the originals are left untouched.

**4. Publish**: `npm run contenu`, then commit and push.

## Editing or removing a project

| Goal | What to do |
| --- | --- |
| change a project text | edit its `projet.yml` |
| replace an image | drop the new file in its folder |
| reorder projects | rename the `01_`, `02_`… prefixes |
| remove a project | delete its folder |

Run `npm run contenu` afterwards in every case.

## Editing the site texts

Everything lives in `content/site.yml`: home, About, contact, showreel, form,
accessibility labels and error pages. A text edited there is picked up on the
next build, with no command to run.

> The step-by-step guide written for a non-developer is in
> **[CONTENU.md](CONTENU.md)** (in French).

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | local server, watches `content/` |
| `npm run contenu` | checks, optimises media and regenerates |
| `npm run build` | production build |
| `npm run build-logos` | rebuilds logos from `ASSETS_EMERIC/00_LOGO/` |
| `npm run lint` | ESLint |

## Code layout

| Folder | What it holds |
| --- | --- |
| `content/` | the single source of content, edited by hand |
| `tools/contenu/` | YAML reading, validation, media, generation |
| `src/content/`, `src/data/` | typed facades over the generated files |
| `src/components/` | interface, panels, video player |
| `src/components/scene/` | the 3D scene and its cards |
| `src/lib/`, `src/store/` | shared hooks and hub state |

`*.generated.*` files are rewritten by `npm run contenu` and must never be edited
by hand.

The site is a single route. Moving between the hub, About and Contact is
application state, not a URL.

---

## Credits

Designed and built by **Tomi-Tom**.

- GitHub: [github.com/Tomi-Tom](https://github.com/Tomi-Tom)
- Portfolio: [tombp.fr](https://www.tombp.fr)

**Available for freelance work.** For a project, a redesign or a custom site,
get in touch through [tombp.fr](https://www.tombp.fr).
