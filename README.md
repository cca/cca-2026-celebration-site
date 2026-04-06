# CCA Class of 2026 Celebration Site

A multi-event celebration platform for the California College of the Arts Class of 2026.

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
│   │   ├── subscribe.astro     # Email subscription page
│   │   └── demo/               # Development demo pages
│   ├── layouts/                # Page layout components
│   │   ├── BaseLayout.astro
│   │   ├── EventLayout.astro
│   │   ├── StudentLayout.astro
│   │   ├── WorkLayout.astro
│   │   └── ...
│   ├── components/
│   │   ├── ui/                 # Generic UI primitives
│   │   ├── landing/            # Landing page sections
│   │   ├── sections/           # Reusable page sections
│   │   ├── events/             # Event-specific components
│   │   ├── effects/            # Visual effect components
│   │   └── global/             # Site-wide components (nav, footer)
│   ├── content/                # Content collections (JSON data)
│   │   ├── events/
│   │   ├── students/
│   │   ├── works/
│   │   ├── people/
│   │   ├── programs/
│   │   ├── video-interviews/
│   │   └── commencement-info/
│   ├── config/
│   │   └── phases.ts           # Phase system configuration
│   ├── styles/                 # Global CSS
│   │   ├── global.css
│   │   ├── animations.css
│   │   ├── fonts.css
│   │   ├── grid.css
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
