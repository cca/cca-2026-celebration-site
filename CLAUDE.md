# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
bun install          # install dependencies
bun run dev          # dev server at localhost:4321
bun run build        # production build to ./dist/
bun run preview      # preview production build
bunx astro check     # type-check .astro files
```

There are no lint or test commands — the project relies on `astro check` for type safety.

## Architecture

This is an Astro 5 static site. All content lives in `src/content/` as JSON files, typed via Zod schemas in `src/content.config.ts`. There is no database, no server rendering, and no external CMS.

### Phase System

The most important architectural concept. A single variable in `src/config/phases.ts` controls what content is visible across the entire site:

```ts
// Four phases in order: 'save-the-date' | 'pre-event' | 'during-event' | 'post-event'
export const CURRENT_PHASE: Phase = 'pre-event';
```

Two utility functions gate visibility:
- `isPhaseAtLeast(current, minimum)` — true if current phase is at or after minimum
- `isPhaseBefore(current, threshold)` — true if current phase is earlier than threshold

In templates, use either direct utility calls or the `PhaseGate` component:
```astro
<PhaseGate visibleIn={['post-event']}>...</PhaseGate>
<PhaseGate hiddenIn={['save-the-date']}>...</PhaseGate>
```

The dev toolbar (Astro dev UI) lets you toggle phases locally without editing `phases.ts`. The override flows through `src/integrations/phase-toolbar/` and is read by `src/lib/utils/phase.ts → getCurrentPhase()`.

### Content Collections

Seven collections defined in `src/content.config.ts`, all loaded from `src/content/{collection}/*.json`:

- **students** — profiles with program refs, ceremony refs, links, photos
- **works** — media entries linked to students and events
- **events** — ceremonies, showcases, thesis shows with schedule/program data
- **programs** — academic programs with division, degreeTypes
- **people** — faculty/speakers/honorees linked to ceremonies
- **commencement-info** — logistics, statistics, downloadable assets
- **video-interviews** — linked to students, hosted on YouTube/Vimeo

All cross-references use Astro's `reference()` helper. Utility functions in `src/lib/utils/collections.ts` handle filtering and grouping (e.g., `getStudentsByEvent()`, `getCandidatesGroupedByDivision()`).

### Theming

No CSS framework. Design tokens are CSS custom properties defined in `src/styles/themes.css`. The active theme is set via a `data-theme` attribute on the `<html>` element (passed as `themeKey` prop to `BaseLayout`).

Theme variants: `commencement`, `commencement-undergrad`, `commencement-grad`, `showcase`, `thesis-undergrad`, `thesis-grad`, `celebration`.

Each theme overrides the full token set: `--color-bg`, `--color-text`, `--color-accent`, `--color-surface`, `--color-border`, plus RGB channels, shimmer colors, gradients, and overlay opacities.

Typography uses fluid sizing via `clamp()` on `--text-xs` through `--text-5xl`. Spacing uses `--space-1` (0.25rem) through `--space-24` (6rem).

### Scroll Animations

Add `.reveal`, `.reveal-scale`, `.reveal-left`, `.reveal-right`, or `.reveal-clip` to any element. `src/scripts/scroll-reveal.ts` runs an `IntersectionObserver` that adds `.is-visible` on viewport entry. For staggered children, add `.stagger-1` through `.stagger-8`. The observer reinitializes on `astro:page-load` for View Transitions compatibility.

### Layout Hierarchy

- `BaseLayout.astro` — root wrapper (head, GTM, global scripts, Header, Footer)
- `EventLayout.astro` — extends Base, adds `ParticleField` and theme support
- `StudentLayout.astro` — student profile with photo header, links, news section
- `WorkLayout.astro` — work detail with media gallery
- `ThesisEventLayout.astro` — thesis exhibition variant of EventLayout

### Key Utility Files

- `src/lib/utils/phase.ts` — `getCurrentPhase()`, `isContentVisible()`
- `src/lib/utils/collections.ts` — all content filtering and grouping helpers
- `src/lib/utils/format.ts` — `fullName()`, `formatDate()`, `formatTime()`, `formatDateRange()`
- `src/lib/utils/frame-data.ts` — frame/border styling data
- `src/lib/utils/calendar.ts` — calendar link utilities

### Static Assets

Remote images from `cca.edu` are allowed in `astro.config.mjs`. Sharp handles image optimization. Fonts are self-hosted WOFF2 files in `public/fonts/` declared in `src/styles/fonts.css`.
