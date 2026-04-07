---
title: Getting Started
description: Local development setup, project structure overview, and key concepts for the CCA 2026 celebration site
section: overview
order: 1
---


This guide walks you through local setup, explains the project structure, and introduces the concepts you need to understand before editing content or adding pages.

## Prerequisites

- [Bun](https://bun.sh/) — this project uses Bun as its package manager and script runner. Think of it as a faster npm: same concepts, different commands (`bun install` instead of `npm install`, `bun run dev` instead of `npm run dev`). It also handles TypeScript natively. Don't mix in npm or yarn — it will create lock file conflicts.
- Node.js 18+ (Bun handles this, but some tooling may need it)
- Git

## Local setup

```sh
git clone <repo-url>
cd cca-2026-celebration-site
bun install
bun run dev
```

The dev server starts at `http://localhost:4321`. Changes to `.astro`, `.ts`, `.css`, and content files hot-reload automatically.

## Key commands

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server at localhost:4321 |
| `bun run build` | Production build to `./dist/` |
| `bun run preview` | Preview the production build locally |
| `bunx astro check` | Type-check all `.astro` files |

There are no lint or test commands. Type safety comes from `astro check`.

## Project structure

```
src/
├── components/     # UI components organized by domain
├── config/         # Phase system, docs nav, and other config
├── content/        # JSON content files (students, events, etc.)
├── integrations/   # Custom Astro integrations (phase toolbar)
├── layouts/        # Page layout wrappers
├── lib/utils/      # Utility functions (collections, format, phase)
├── pages/          # File-based routing — every .astro file is a route
├── scripts/        # Client-side TypeScript (scroll-reveal, header-scroll)
└── styles/         # Global CSS, tokens, themes, grid
```

## The three things you need to understand first

### 1. The phase system

A single variable in `src/config/phases.ts` controls what content is visible across the entire site. Four phases (`save-the-date` → `pre-event` → `during-event` → `post-event`) gate different content. Changing the phase and redeploying is how the site transitions between states.

→ Read the [Phase System](/docs/phase-system/) guide before touching any phase-gated content.

### 2. Content collections

All site data is JSON, not a database. `src/content/{collection}/*.json` files are validated against Zod schemas at build time. If a JSON file has an invalid field, the build fails — this is intentional.

→ Read [Content Collections](/docs/content-collections/) before adding or editing content.

### 3. Design tokens

No CSS framework. All styles use CSS custom properties defined in `src/styles/themes.css`. Use `var(--space-4)` not `1rem`, `var(--text-base)` not `16px`. The theme system changes the meaning of tokens per page.

→ Read [Styling & Animation](/docs/styling-and-animation/) before writing component styles.

## Your first change

### Editing event copy

1. Find the event's JSON file in `src/content/events/`
2. Edit the `description` field
3. The dev server reloads automatically — verify at `http://localhost:4321`
4. Run `bunx astro check` to confirm no type errors
5. Commit and push — the CI pipeline (if configured) runs the build

### Adding a student profile

See the [Content Workflow](/docs/content-workflow/) guide for step-by-step instructions.

## The dev toolbar

In dev mode, a floating toolbar appears at the bottom of the browser. Use the Phase Switcher panel to toggle between phases without editing `phases.ts`. This is the correct way to test phase-gated content locally.

## Common gotchas for new developers

**`bunx` not `npx`** — All Astro CLI commands use `bunx astro`, not `npx astro`.

**`reference()` returns an ID, not the object** — When you access a cross-referenced field like `student.data.program`, you get `{ id: 'bfa-illustration' }`, not the program object. Use `getEntry()` or the utility functions in `collections.ts` to resolve references.

**The build is static** — There is no server rendering. Every page is pre-built to HTML. Nothing runs at request time.

**Type errors fail the build** — `bunx astro check` before committing. The CI build will also catch type errors, but it's faster to catch them locally.
