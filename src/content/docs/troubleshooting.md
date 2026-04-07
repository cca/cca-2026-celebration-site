---
title: Troubleshooting
description: Common errors, Zod validation failures, missing references, build errors, and FAQ for CCA 2026 developers
section: ops
order: 3
---


## Build errors

### Zod validation failure

**Symptom:** Build fails with something like:
```
[content] "events" → "my-event.json": Invalid literal value, expected "commencement"
```

**Cause:** A field in your JSON file doesn't match the schema in `src/content.config.ts`.

**Fix:**
1. Open the failing JSON file
2. Find the field mentioned in the error
3. Check what values the schema allows (look at the `z.enum(...)` in `content.config.ts`)
4. Fix the value and rebuild

Common mistakes:
- `type` field on an event using a value not in the enum (e.g., `"panel"` instead of `"symposium"`)
- `degreeLevel` using `"grad"` instead of `"graduate"`
- Missing a required field entirely (the error says `Required`)

### Missing cross-reference

**Symptom:**
```
[content] "students" → "jane-doe.json": Invalid reference — "bfa-illustration-wrong" not found in "programs"
```

**Cause:** A `reference()` field points to an ID that doesn't exist in the target collection.

**Fix:** Check that the referenced ID matches an actual filename (without `.json`) in the target collection directory.

### TypeScript errors in `.astro` files

**Symptom:** `bunx astro check` reports type errors.

Common causes:

1. **Accessing a possibly-undefined optional field without null-guarding:**
   ```ts
   // Error: 'schedule' is possibly undefined
   event.data.schedule.map(...)

   // Fix:
   event.data.schedule?.map(...)
   // or
   if (event.data.schedule) { ... }
   ```

2. **Wrong prop type passed to a component** — read the component's `interface Props` to see what it expects.

3. **Importing from wrong path** — paths in `.astro` frontmatter are relative to the file. `../../components/` from a page in `src/pages/thesis/` goes up two levels to `src/`, then into `components/`.

## Runtime issues (dev mode)

### Phase-gated content not showing

**Symptom:** Content you expect to be visible at the current phase isn't showing.

**Fix:**
1. Check the Astro dev toolbar (bottom of browser) — is the Phase Switcher overriding to a different phase?
2. Verify the `PhaseGate` props: `visibleIn` vs `hiddenIn`, and that your current phase is in the right array
3. Check that you're calling `getCurrentPhase()` (not reading `CURRENT_PHASE` directly)

### Images not loading

**Symptom:** Broken image in browser, 404 in network tab.

**Fix:** The image file must exist in `public/images/cca-photography/`. The path in the JSON must start with `/images/` (not `./` or `images/`). Check that the filename casing matches exactly — file paths are case-sensitive on Linux (including CI/CD environments).

### Content collection not updating

**Symptom:** You added/changed a JSON file but the site doesn't reflect it.

**Fix:** Astro's content layer caches collection data. Stop the dev server and restart with `bun run dev`. If that doesn't help, delete `.astro/` (the cache directory) and restart.

```sh
rm -rf .astro/
bun run dev
```

## FAQ

### Can I add a new event type?

Yes — add the new type string to the `type` field enum in `src/content.config.ts`:

```ts
type: z.enum(["commencement", "showcase", ..., "your-new-type"]),
```

Then rebuild. All existing JSON files continue to work unchanged.

### Can I add a new theme?

Yes — add a `[data-theme="your-key"]` block to `src/styles/themes.css` with all required token overrides. See [Styling & Animation](/docs/styling-and-animation/) for the full token list. Then pass `themeKey="your-key"` to `BaseLayout` or `EventLayout`.

The `themeKey` on events is validated against an enum in the schema — if you want event JSON to reference a new theme, add it to that enum too.

### Why does the build fail on CI but pass locally?

Most common causes:
1. **File path casing** — macOS is case-insensitive; Linux (CI) is not. `Jane-Doe.jpg` and `jane-doe.jpg` are different files on Linux.
2. **Missing file in git** — you added a file but didn't `git add` it.
3. **Uncommitted changes** — your local JSON edits aren't committed.

### How do I add a photo gallery to a thesis page?

Implement it directly in the page's `.astro` file — there's no shared gallery component. Look at `src/pages/thesis/architecture-studio-conversations.astro` or `src/pages/thesis/vcs-spring-symposium.astro` for reference implementations with the full scoped CSS.

### The sidebar nav link is wrong for a new docs page

Check `src/config/docs-nav.ts` — the `slug` for each nav item must exactly match the content file's name (without `.md`). The URL is always `/docs/{slug}/`.

### `bunx astro check` reports errors in `scripts/` directory

Scripts in `src/scripts/` are excluded from `astro check` in `tsconfig.json`. If you're seeing errors there, check `tsconfig.json` for the exclude list. The workaround is to have Bun's own type-checking handle those files.
