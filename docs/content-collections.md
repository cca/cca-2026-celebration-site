# Content Collections

All site content lives as JSON files under `src/content/`. Astro's Content Layer reads these files, validates them against Zod schemas defined in `src/content.config.ts`, and makes them available as typed objects in component frontmatter.

## How it works

```
src/content/{collection}/*.json
        ↓
src/content.config.ts  (Zod schema validates every file at build time)
        ↓
getCollection('events')  (typed query in your component)
        ↓
strongly-typed array of collection entries
```

If a JSON file fails schema validation, the build fails. This is intentional — the schema is the contract between content editors and components.

## The seven collections

| Collection | Path | Purpose |
|---|---|---|
| `events` | `src/content/events/*.json` | Ceremonies, showcases, thesis exhibitions, and other celebrations |
| `students` | `src/content/students/*.json` | Student profiles with program refs, photo, bio, links |
| `works` | `src/content/works/*.json` | Media entries (images, video) linked to students and events |
| `programs` | `src/content/programs/*.json` | Academic programs with division and degree types |
| `people` | `src/content/people/*.json` | Faculty, speakers, and honorees linked to ceremonies |
| `commencement-info` | `src/content/commencement-info/*.json` | Logistics, statistics, downloadable assets |
| `video-interviews` | `src/content/video-interviews/*.json` | Student interview metadata (YouTube/Vimeo) |

## Key schema patterns

### Required vs optional fields

Required fields must be present in every JSON file. Optional fields use `.optional()` in the Zod schema:

```ts
// Required — the build fails if this is missing
title: z.string(),

// Optional — the field may be absent
bio: z.string().optional(),
schedule: z.array(...).optional(),
```

In components, always null-guard optional fields before using them:

```astro
{event.data.schedule && (
  <CeremonySchedule schedule={event.data.schedule} />
)}
```

### Cross-references with `reference()`

Collections reference each other using Astro's `reference()` helper:

```ts
// In the students schema — a student belongs to one program
program: reference('programs'),

// A student may appear in multiple ceremonies
ceremonies: z.array(reference('events')).optional(),
```

**Important gotcha:** `reference()` fields resolve to `{ id: string }` objects, not the full collection entry. To get the full entry, you must call `getEntry()` or use a utility function from `collections.ts`:

```ts
// Wrong — student.data.program is { id: 'bfa-illustration' }, not the full program
const programName = student.data.program.name; // undefined!

// Correct
import { getEntry } from 'astro:content';
const program = await getEntry('programs', student.data.program.id);
const programName = program.data.name;
```

The utility functions in `src/lib/utils/collections.ts` handle this for you in most cases.

### Discriminated unions

The `works` collection uses a `type` field on each media item to distinguish image, video, audio, and embed:

```ts
media: z.array(
  z.object({
    type: z.enum(['image', 'video', 'audio', 'embed']),
    src: z.string(),
    alt: z.string().optional(),
    // ...
  })
)
```

Similarly, the `events` schema uses `type` to distinguish commencement ceremonies from showcases, thesis exhibitions, celebrations, and other event types.

## Adding content

### Adding a student

1. Create `src/content/students/{slug}.json` modeled on an existing student file.
2. The `slug` field must match the filename (without `.json`).
3. `program` must be the `id` of an existing program entry (e.g., `"bfa-illustration"`).
4. `ceremonies` is optional — only add it if the student is listed in a ceremony program.

### Adding a work

1. Create `src/content/works/{slug}.json`.
2. `students` is an array of student IDs: `[{ "id": "jane-doe" }]`
3. `events` is an array of event IDs: `[{ "id": "bfa-senior-exhibitions" }]`
4. `media` requires at least one entry with `type` and `src`.

## The `collections.ts` utility layer

`src/lib/utils/collections.ts` exports pre-built query functions. **Pages should call these instead of writing their own `getCollection()` + filter logic.** This keeps filtering logic centralized and avoids subtle bugs.

| Function | Returns |
|---|---|
| `getWorksByStudent(studentId)` | Works linked to a specific student, sorted by `order` |
| `getWorksByEvent(eventId)` | Works linked to a specific event, sorted by `order` |
| `getStudentsByEvent(eventId)` | Students who have works in a given event |
| `getStudentsByProgram(programId)` | Students enrolled in a specific program |
| `getCelebrationEvents()` | All events of type `'celebration'`, sorted by date |
| `getPeopleByRole(role)` | People filtered by role (e.g., `'distinguished-alumni'`) |
| `getPeopleByCeremony(eventId)` | People linked to a specific ceremony |
| `getStudentsByCeremony(eventId)` | Students linked to a specific ceremony |
| `getAllTags()` | Sorted list of all tags used across works |
| `getWorksByTag(tag)` | Works with a specific tag, sorted by `order` |
| `getAllStudentsGroupedByDivision()` | All students organized by division → program |
| `getCandidatesGroupedByDivision(eventId)` | Ceremony candidates organized by division → program |

All functions are `async` and return typed arrays. Await them in component frontmatter:

```ts
import { getWorksByStudent } from '../lib/utils/collections';

const works = await getWorksByStudent(student.id);
```

## `format.ts` helpers

`src/lib/utils/format.ts` exports formatting functions for display values:

| Function | Input | Output example |
|---|---|---|
| `fullName(student)` | student entry | `"Jane Doe"` |
| `formatDate(dateStr)` | `"2026-05-15"` | `"Friday, May 15, 2026"` |
| `formatTime(timeStr)` | `"10:00 AM – 1:00 PM"` | `"10 – 1 pm"` |
| `formatDateRange(start, end?)` | `"2026-05-15"`, `"2026-05-16"` | `"May 15–16, 2026"` |

`formatTime` handles ranges automatically and drops `:00` minutes for cleaner output. `formatDateRange` smartly collapses same-month ranges.
