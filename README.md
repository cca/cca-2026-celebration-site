# CCA Class of 2026 Celebration Site

A multi-event celebration platform for the California College of the Arts Class of 2026.

## New here? Start with these

Developer docs are served as a live site at `/docs/` when running locally. Start with these:

| Doc | What it covers |
|---|---|
| [Getting Started](/docs/getting-started/) | Local setup and key concepts |
| [Phase System](/docs/phase-system/) | One variable controls what content the whole site shows — how it works and how to use it |
| [Content Collections](/docs/content-collections/) | JSON files, Zod schemas, typed queries, and the utility layer |
| [Component Guide](/docs/component-guide/) | What lives in each `components/` subdirectory and the layout hierarchy |
| [Styling & Animation](/docs/styling-and-animation/) | Design tokens, themes, fluid type, and the scroll-reveal system |

Additional reference docs: [Schema Reference](/docs/schema-reference/), [Component Catalog](/docs/component-catalog/), [Route Index](/docs/route-index/).

## Overview

This site covers all end-of-year celebration events: commencement ceremonies, graduate showcases, thesis exhibitions, student profiles, and work galleries. Content visibility is managed through a phase system that progressively reveals information as events approach.

## Tech Stack

- **Astro 5** — static site framework with Content Layer
- **TypeScript** — throughout components and config
- **Custom CSS** — design tokens, theming, grid, animations
- **Sharp** — image processing
- **Bun** — package manager and script runner

## Commands

All commands are run from the root of the project:

| Command           | Action                                           |
| :---------------- | :----------------------------------------------- |
| `bun install`     | Install dependencies                             |
| `bun run dev`     | Start local dev server at `localhost:4321`       |
| `bun run build`   | Build production site to `./dist/`               |
| `bun run preview` | Preview production build locally                 |
| `bunx astro ...`  | Run Astro CLI commands (e.g. `astro check`)      |

## Key Concepts

| Concept | One-liner | Doc |
|---|---|---|
| **Phase System** | One variable gates all content visibility across the site | [/docs/phase-system/](/docs/phase-system/) |
| **Content Collections** | All content is JSON → Zod schema → typed component queries | [/docs/content-collections/](/docs/content-collections/) |
| **Component Guide** | Directory taxonomy, layout hierarchy, and rules for pages | [/docs/component-guide/](/docs/component-guide/) |
| **Styling & Animation** | Design tokens, themes, fluid type, and scroll-reveal | [/docs/styling-and-animation/](/docs/styling-and-animation/) |

## Project Structure

```text
/
├── public/                     # Static assets (images, fonts, favicon)
├── src/
│   ├── pages/                  # File-based routes
│   │   ├── index.astro         # Landing page
│   │   ├── commencement/       # Commencement ceremony pages
│   │   ├── showcase/           # Graduate showcase pages
│   │   ├── thesis/             # Thesis exhibition pages
│   │   ├── students/           # Student profile pages
│   │   ├── docs/               # Live developer documentation site
│   │   ├── subscribe.astro     # Email subscription page
│   │   └── demo/               # Development demo pages
│   ├── layouts/                # Page layout components
│   │   ├── BaseLayout.astro
│   │   ├── EventLayout.astro
│   │   ├── DocsLayout.astro    # Docs site layout
│   │   ├── StudentLayout.astro
│   │   ├── WorkLayout.astro
│   │   └── ...
│   ├── components/
│   │   ├── ui/                 # Generic UI primitives
│   │   ├── docs/               # Docs site components (DocsNav, DocCallout)
│   │   ├── landing/            # Landing page sections
│   │   ├── sections/           # Reusable page sections
│   │   ├── events/             # Event-specific components
│   │   ├── effects/            # Visual effect components
│   │   └── global/             # Site-wide components (nav, footer)
│   ├── content/                # Content collections (JSON data + docs markdown)
│   │   ├── events/
│   │   ├── students/
│   │   ├── works/
│   │   ├── people/
│   │   ├── programs/
│   │   ├── video-interviews/
│   │   ├── commencement-info/
│   │   └── docs/               # Markdown source for the /docs/ site
│   ├── config/
│   │   ├── phases.ts           # Phase system configuration
│   │   └── docs-nav.ts         # Docs site navigation structure
│   ├── styles/                 # Global CSS
│   │   ├── global.css
│   │   ├── animations.css
│   │   ├── fonts.css
│   │   ├── grid.css
│   │   ├── docs.css            # Docs site styles
│   │   └── themes/
│   └── scripts/                # Client-side animation and interaction scripts
└── package.json
```

## Content System

Content is managed through 7 Astro Content Layer collections, with data stored as JSON files under `src/content/`:

| Collection          | Description                                      |
| :------------------ | :----------------------------------------------- |
| `events`            | Celebration events (commencement, showcase, etc.)|
| `students`          | Student profiles                                 |
| `works`             | Student work entries with gallery data           |
| `people`            | Faculty, staff, and speakers                     |
| `programs`          | Academic programs/departments                    |
| `video-interviews`  | Student video interview metadata                 |
| `commencement-info` | Ceremony-specific details and logistics          |

## Phase System

The site uses 4 content phases to progressively reveal information:

| Phase           | Description                              |
| :-------------- | :--------------------------------------- |
| `save-the-date` | Minimal teaser — dates and event names only |
| `pre-event`     | Full event details, student profiles, work |
| `during-event`  | Live event mode                          |
| `post-event`    | Archive mode with full retrospective content |

To change the active phase, edit `src/config/phases.ts`. A dev toolbar integration is available to test phase behavior locally without changing the config file.

## Event Hero Images

Two display modes are available, set in the event's JSON data file:

| Mode | Field | Description |
| :--- | :---- | :---------- |
| **Poster** | `image` | Clean unmasked image. Supports `aspectRatio` and `heroOnly: true`. |
| **Framed** | `heroImages` | SVG clip-masked wavy frame. Pass `frameId: "frame-01"` through `"frame-23"`. Use `heroImageSize="large"` on `EventHero` to scale up. |

If neither field is set, the hero renders with no image. Both modes are handled by `src/components/events/EventHero.astro`.

## Event Photo Galleries

Thesis event pages can include a photo gallery section built directly into the page `.astro` file (see `src/pages/thesis/architecture-studio-conversations/index.astro` as a reference). The first image in the grid gets a featured (2-column, 16:9) treatment; remaining images use 4:3.

New photos should be placed in `public/images/cca-photography/` and added to the `ccaPhotography` array in `src/pages/demo/photography.astro` to keep the asset inventory up to date.

## Adding a New Event

Adding an event requires three coordinated changes — all are necessary:

1. **Data file** — create `src/content/events/{slug}.json` (model on an existing event)
2. **Detail page** — create `src/pages/thesis/{slug}.astro` (copy the closest existing page)
3. **Bento grid** — add the event to `src/components/landing/BentoEvents.astro`: add a `{ slug, size, area }` entry to the `layout` array, then add the `area` name to all three `grid-template-areas` blocks (mobile, tablet, desktop)

The bento grid is manually laid out — confirm visually in the browser after adding a new event. See `CLAUDE.md` or the live docs for more detail.

## Updating Event Details

When new details arrive from the CCA portal (schedule, presenters, admission info), update two files:

1. **`src/content/events/{slug}.json`** — update `description` and add any schema-supported fields. The `schedule` field (`{ time, label }` entries) is optional, so events without schedules are unaffected.

2. **`src/pages/thesis/{slug}.astro`** — each page is custom-built, so add whatever sections the content warrants: `EventContextSection` for narrative text, `CeremonySchedule` for a timed program, an inline styled list for presenters or speakers, or an inline photo gallery. Content not supported by the schema (like presenter names) lives as a hardcoded array in the page frontmatter.

See `CLAUDE.md` or `/docs/` for the full list of building blocks and reference page examples.
