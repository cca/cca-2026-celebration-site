# Phase System

The phase system is the single most important architectural concept in this codebase. One variable controls what content is visible across the entire site — there are no feature flags, no per-component toggles, no per-user logic.

## What it is and why it exists

Events like commencement are announced weeks before they happen. The site needs to serve different content depending on how close the event is:

- Before details are confirmed: show only dates and event names
- Once details are locked: reveal the full program, student profiles, and works
- During the event: may need live-specific messaging
- After: archive mode with retrospective content

Rather than conditionally rendering each piece of content independently, the phase system lets you describe content as "visible starting from phase X" or "hidden after phase Y." One deployment-time change flips everything.

## The four phases

| Phase | What it means |
|---|---|
| `save-the-date` | Minimal teaser — dates and event names only |
| `pre-event` | Full event details, student profiles, and works are visible |
| `during-event` | Live event mode (active during the event itself) |
| `post-event` | Archive mode with full retrospective content |

Phases are ordered. `save-the-date` is earliest, `post-event` is latest. The utility functions (`isPhaseAtLeast`, `isPhaseBefore`) use this order.

## How to change the phase

Edit one line in `src/config/phases.ts`:

```ts
export const CURRENT_PHASE: Phase = 'pre-event';
```

Change `'pre-event'` to any of the four phase strings, then rebuild and deploy. The entire site shifts.

## Testing phases locally without editing the file

The Astro dev toolbar (the floating toolbar at the bottom of the browser in dev mode) includes a Phase Switcher panel. Use it to toggle between phases without touching `phases.ts`. The override is stored in memory for the session — it disappears on reload.

The toolbar override flows through `src/integrations/phase-toolbar/` and is read by `getCurrentPhase()` in `src/lib/utils/phase.ts`.

## Always call `getCurrentPhase()` — never read `CURRENT_PHASE` directly

```ts
// Wrong — bypasses the toolbar override in dev mode
import { CURRENT_PHASE } from '../config/phases';

// Correct
import { getCurrentPhase } from '../lib/utils/phase';
const phase = getCurrentPhase();
```

`getCurrentPhase()` checks for a dev toolbar override first, then falls back to `CURRENT_PHASE`. If you read `CURRENT_PHASE` directly, your phase testing with the toolbar won't work.

## Gating content with `PhaseGate`

`PhaseGate.astro` lives at `src/components/PhaseGate.astro`. Use it to conditionally render any block of content:

```astro
---
import PhaseGate from '../components/PhaseGate.astro';
---

<!-- Only shown during and after the event -->
<PhaseGate visibleIn={['during-event', 'post-event']}>
  <LivestreamEmbed url={event.data.livestreamUrl} />
</PhaseGate>

<!-- Hidden only in save-the-date; shown in all later phases -->
<PhaseGate hiddenIn={['save-the-date']}>
  <EventDetails event={event} />
</PhaseGate>
```

Use `visibleIn` when you have an explicit allowlist of phases where the content should appear. Use `hiddenIn` when it's easier to name the phases where it should be suppressed. Don't use both at once — pick one.

## Gating content with utility functions directly

For conditional logic inside component frontmatter or layout scripts, use `isPhaseAtLeast` and `isPhaseBefore` from `src/config/phases.ts`:

```ts
import { getCurrentPhase } from '../lib/utils/phase';
import { isPhaseAtLeast, isPhaseBefore } from '../config/phases';

const phase = getCurrentPhase();

// Show the full program once we're in pre-event or later
const showFullProgram = isPhaseAtLeast(phase, 'pre-event');

// Hide the "coming soon" banner once we're past save-the-date
const showComingSoon = isPhaseBefore(phase, 'pre-event');
```

Both functions compare against the ordered phase list — they don't do string equality.

## Common patterns

**Hide a nav item until details are available:**
```astro
<PhaseGate hiddenIn={['save-the-date']}>
  <a href="/students">Student Profiles</a>
</PhaseGate>
```

**Progressively reveal page sections:**
```astro
<!-- Always visible -->
<EventHero event={event} />

<!-- Visible from pre-event onward -->
<PhaseGate hiddenIn={['save-the-date']}>
  <EventContextSection paragraphs={[event.data.description]} />
</PhaseGate>

<!-- Only visible post-event -->
<PhaseGate visibleIn={['post-event']}>
  <PhotoGallery />
</PhaseGate>
```

**Conditional logic in frontmatter:**
```ts
const phase = getCurrentPhase();
const title = isPhaseBefore(phase, 'pre-event')
  ? 'Coming Soon'
  : event.data.title;
```
