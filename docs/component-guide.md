# Component Guide

Components are organized by domain into subdirectories of `src/components/`. Knowing which directory to look in — and which to reach for when building new pages — is the fastest way to navigate the codebase.

## Component taxonomy

| Directory | What it contains | When to use |
|---|---|---|
| `ui/` | Generic primitives | Anywhere you need a button, breadcrumb, chip, download link, video embed, quote, or TOC |
| `events/` | Event-specific rendering | Event detail pages — hero, schedule, context copy, celebration cards |
| `landing/` | Landing page sections | The index page bento grid, event list view, and view toggle only |
| `sections/` | Reusable full-width page sections | Email signup, honoree spotlight, info section, in memoriam, statistics, social feed, past gallery |
| `effects/` | Visual / animation | Use sparingly — these are expensive WebGL and canvas components |
| `global/` | Site-wide shell | Header, footer, navigation — never duplicate or nest these |
| `people/` | Person display | `PersonCard` and `PersonGrid` for faculty, speakers, honorees |
| `showcase/` | Showcase event-specific | Credits roll, newsroom grid, student spotlight, video interviews |
| `students/` | Student profile display | `StudentCard`, `StudentGrid` |
| `works/` | Work entry display | `WorkCard`, `WorkGrid` |
| `program/` | Commencement program print layout | Candidates list, program hero, disclaimer, agenda |

### `ui/` — primitives

Use these everywhere. They're the lowest-level building blocks.

- `Button.astro` — styled anchor/button element
- `Breadcrumb.astro` — page breadcrumb trail
- `FilterChips.astro` — interactive filter UI (client-side)
- `DownloadLink.astro` — downloadable asset link with icon
- `VideoEmbed.astro` — YouTube/Vimeo embed wrapper
- `QuoteBlock.astro` — pull quote styling
- `FramedImage.astro` — image with SVG clip-mask frame
- `TableOfContents.astro` — sticky TOC navigation
- `StickyTocLayout.astro` — layout wrapper for TOC pages
- `CcaSeal.astro` — CCA seal graphic

### `events/` — event-specific rendering

- `EventHero.astro` — hero section with image (poster or framed mode) and event metadata. Handles both `image` and `heroImages` fields. See the [README](../README.md#event-hero-images) for field details.
- `EventDetails.astro` — date, time, location, RSVP link display
- `EventContextSection.astro` — narrative text section, accepts a `paragraphs` array
- `CeremonySchedule.astro` — vertical timeline card from a `{ time, label }[]` array
- `CeremonyPage.astro` — full commencement ceremony page wrapper
- `CelebrationCard.astro` — card component for celebration-type events
- `SpeakerFeature.astro` — featured speaker/honoree display
- `BFASeniorExhibitionsEntryDetails.astro` — specialized entry details for BFA senior exhibitions

### `landing/` — landing page only

- `BentoEvents.astro` — the manually-designed grid of all celebration events
- `BentoEventCard.astro` — individual card within the bento grid
- `EventListView.astro` — list-format alternative view of events
- `EventViewToggle.astro` — grid/list toggle control
- `DecorativeCell.astro` — non-content decorative cells in the bento grid

### `sections/` — reusable page sections

These are full-width sections you can drop into any event or content page:

- `EmailSignup.astro` — email subscription form
- `HonoreeSpotlight.astro` — featured honoree display
- `InfoSection.astro` — general info section with heading and body content
- `InMemoriam.astro` — in memoriam list from `commencement-info` data
- `StatisticsGrid.astro` — statistics display grid
- `PastGallery.astro` — historical photo gallery
- `SocialFeed.astro` — social media feed embed

### `effects/` — use sparingly

These are expensive visual components. Each one runs a WebGL shader, canvas animation, or complex SVG animation. Don't add more than one or two to a page.

- `ParticleField.astro` — animated particle background (used in EventLayout)
- `ParticleFieldArrows.astro` — particle field variant with arrows
- `ArrowLoop3D.astro` — 3D animated arrow loop
- `ChimeraLoop3D.astro` — 3D animated Chimera logo
- `ConstellationGrid.astro` — animated constellation graphic
- `HalftoneDisplacement.astro` — halftone image displacement effect
- `HalftoneProceduralScan.astro` — halftone scan line effect
- `PrismaticFlare.astro` — prismatic light flare overlay

### `global/` — site-wide shell

- `Header.astro` — site header with navigation
- `Footer.astro` — site footer
- `Navigation.astro` — main navigation component

These are included once by `BaseLayout`. Never import them into a page or component directly.

## `PhaseGate.astro`

`PhaseGate` lives at `src/components/PhaseGate.astro` (root of components, not in a subdirectory). It's a special component — see [docs/phase-system.md](phase-system.md) for full usage.

```astro
import PhaseGate from '../components/PhaseGate.astro';
```

## Layout hierarchy

All pages use one of these layouts, which are in `src/layouts/`:

```
BaseLayout
├── EventLayout          — event detail pages (adds ParticleField, theme support)
│   └── ThesisEventLayout — thesis exhibition variant of EventLayout
├── StudentLayout        — student profile with photo header and links
└── WorkLayout           — work detail with media gallery
```

### When to use each

**`BaseLayout`** — the root wrapper. Provides `<head>`, GTM, global scripts, Header, and Footer. Every other layout extends it. Use directly only for one-off pages that don't fit another layout category (e.g., `subscribe.astro`).

**`EventLayout`** — for any event detail page (commencement, showcase, thesis). Adds a `ParticleField` background and wires up the `themeKey` prop for theming.

**`ThesisEventLayout`** — extends EventLayout with thesis exhibition-specific layout conventions.

**`StudentLayout`** — wraps student profile pages with a photo header, program info, and external links section.

**`WorkLayout`** — wraps work detail pages with a media gallery area at the top.

### The `themeKey` prop

`BaseLayout` (and by extension all layouts) accepts a `themeKey` prop that sets `data-theme` on the `<html>` element. This controls the active theme for the entire page. Pass it from the event's data:

```astro
<EventLayout themeKey={event.data.themeKey}>
```

Available theme keys: `commencement`, `showcase`. See [docs/styling-and-animation.md](styling-and-animation.md#theme-system) for how themes work.

## Rule of thumb: keep pages thin

Pages in `src/pages/` should do three things: query data, pass data to components, and compose the layout. If a page's frontmatter or template is getting long, extract it to a section component in `src/components/sections/`.

```astro
---
// Good — thin page
const event = await getEntry('events', slug);
const works = await getWorksByEvent(event.id);
---
<EventLayout themeKey={event.data.themeKey}>
  <EventHero event={event} />
  <EventContextSection paragraphs={[event.data.description]} />
  <WorkGrid works={works} />
</EventLayout>
```

The components handle their own layout, styling, and animation. Pages just wire them together.
