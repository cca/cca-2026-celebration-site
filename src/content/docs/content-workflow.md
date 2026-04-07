---
title: Content Workflow
description: Step-by-step instructions for adding events, students, works, and people to the CCA 2026 site
section: workflow
order: 1
---


This guide covers the most common content editing tasks: adding events, students, and works. All content lives as JSON files validated by Zod — if your JSON is invalid, the build fails with a clear error.

## General rules

- **Filename = slug.** The filename (without `.json`) is the ID used for cross-references and URL paths.
- **Copy an existing file.** Don't write JSON from scratch — copy the closest existing entry and modify it.
- **Run `bunx astro check` after changes.** Type errors in frontmatter or templates surface here.

## Adding an event

Three files are always required. Complete all three before considering the task done.

### 1. Data file — `src/content/events/{slug}.json`

Copy an existing event file and update the fields. Required fields:

```json
{
  "title": "MFA Writing Reading",
  "slug": "mfa-writing-reading",
  "shortTitle": "MFA Writing",
  "type": "thesis-exhibition",
  "degreeLevel": "graduate",
  "themeKey": "showcase",
  "date": "2026-05-10",
  "location": "CCA San Francisco Campus",
  "address": "1111 8th Street, San Francisco, CA 94107",
  "description": "Join us for..."
}
```

The `slug` field must match the filename.

### 2. Detail page — `src/pages/thesis/{slug}.astro`

Copy the closest existing thesis page and update the content query. At minimum:

```astro
---
import { getEntry } from 'astro:content';
import ThesisEventLayout from '../../layouts/ThesisEventLayout.astro';
import EventHero from '../../components/events/EventHero.astro';
import EventContextSection from '../../components/events/EventContextSection.astro';

const event = await getEntry('events', 'mfa-writing-reading');
if (!event) return Astro.redirect('/404');
---

<ThesisEventLayout event={event} title={event.data.title} description={event.data.description}>
  <EventHero event={event} />
  <EventContextSection paragraphs={[event.data.description]} />
</ThesisEventLayout>
```

### 3. Bento grid — `src/components/landing/BentoEvents.astro`

Add a `{ slug, size, area }` entry to the `layout` array, then add the `area` name to **all three** `grid-template-areas` blocks (mobile, tablet, desktop). Flag this for visual confirmation — the grid layout is manually designed.

## Adding a schedule

Update the event's JSON file with the `schedule` array:

```json
"schedule": [
  { "time": "11:00 AM", "label": "Welcome and Opening Remarks" },
  { "time": "11:15 AM", "label": "Student Presentations" },
  { "time": "12:30 PM", "label": "Reception" }
]
```

Then in the page `.astro` file, render it with `CeremonySchedule`:

```astro
{event.data.schedule && (
  <section id="schedule" class="content-section reveal">
    <h2 class="section-heading">Program Schedule</h2>
    <CeremonySchedule schedule={event.data.schedule} />
  </section>
)}
```

Always null-guard since `schedule` is optional in the schema.

## Adding a student

1. Create `src/content/students/{slug}.json`
2. Required fields: `firstName`, `lastName`, `slug`, `photo` (`src` + `alt`), `program` (ID of an existing program), `degreeLevel`, `degreeType`, `expectedGraduation`
3. The `program` value must match an existing filename in `src/content/programs/` — e.g., `"bfa-illustration"` refers to `src/content/programs/bfa-illustration.json`

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "slug": "jane-doe",
  "photo": {
    "src": "/images/cca-photography/jane-doe.jpg",
    "alt": "Jane Doe portrait"
  },
  "program": "bfa-illustration",
  "degreeLevel": "undergraduate",
  "degreeType": "BFA",
  "expectedGraduation": "2026"
}
```

4. The photo must exist in `public/images/cca-photography/`. See [Asset Pipeline](/docs/asset-pipeline/) for naming conventions.

## Adding a work

1. Create `src/content/works/{slug}.json`
2. `students` is an array referencing student IDs; `events` is an array referencing event IDs
3. `media` requires at least one entry

```json
{
  "title": "Untitled No. 3",
  "slug": "jane-doe-untitled-3",
  "students": [{ "id": "jane-doe" }],
  "events": [{ "id": "bfa-senior-exhibitions" }],
  "year": 2026,
  "media": [
    {
      "type": "image",
      "src": "/images/cca-photography/untitled-3.jpg",
      "alt": "Acrylic on canvas, geometric forms in teal and orange"
    }
  ]
}
```

## Adding a person (honoree, speaker, faculty)

1. Create `src/content/people/{slug}.json`
2. `role` must be one of: `honorary-doctorate`, `professor-emeritus`, `distinguished-alumni`, `other`
3. `ceremony` (optional) links to an event ID

```json
{
  "name": "Dr. Example Person",
  "slug": "dr-example-person",
  "role": "honorary-doctorate",
  "ceremony": "commencement-undergraduate",
  "bio": "Dr. Example is..."
}
```

## Presenters and speakers not in the schema

Data that doesn't fit the schema (e.g., panel presenters, symposium speakers with specific roles) lives as a hardcoded array in the page's frontmatter — not in JSON, not in a shared component:

```astro
---
const presenters = [
  'Name One — Title, Affiliation',
  'Name Two — Title, Affiliation',
];
---

<ul>
  {presenters.map(p => <li>{p}</li>)}
</ul>
```

This is intentional. These edge cases are too event-specific to generalize into a schema.

## Verifying your changes

1. `bun run dev` — check the page renders correctly
2. `bunx astro check` — catch type errors
3. `bun run build` — confirm the full static build succeeds
