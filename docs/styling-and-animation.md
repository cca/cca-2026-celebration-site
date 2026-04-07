# Styling and Animation

## No CSS framework

There is no Tailwind, Bootstrap, or other utility framework in this project. All styles are authored as CSS custom properties (design tokens) defined in `src/styles/themes.css`, with component-scoped styles written directly in each `.astro` file's `<style>` block.

What this means in practice: **use the tokens, not hardcoded values.** Instead of `font-size: 18px`, use `font-size: var(--text-base)`. Instead of `padding: 32px`, use `padding: var(--space-8)`. This keeps everything responsive and theme-aware automatically.

## Design tokens

All tokens are CSS custom properties defined in `src/styles/themes.css`. They're available globally — no import needed.

### Typography

Three font families, accessed via token:

```css
--font-display   /* Chimera Display — editorial headings */
--font-body      /* Lineto Brown — body text */
--font-heading   /* Lineto Brown — also used for headings */
```

Type scale (see [Fluid type](#fluid-type) below for why these scale automatically):

```css
--text-xs    --text-sm    --text-base
--text-lg    --text-xl    --text-2xl
--text-3xl   --text-4xl   --text-5xl
```

Additional typographic tokens:

```css
--heading-weight      /* 700 */
--heading-transform   /* none */
--heading-tracking    /* -0.01em */
```

### Spacing

A 12-step scale from 0.25rem to 6rem:

```css
--space-1   /* 0.25rem */   --space-2   /* 0.5rem  */
--space-3   /* 0.75rem */   --space-4   /* 1rem    */
--space-5   /* 1.25rem */   --space-6   /* 1.5rem  */
--space-8   /* 2rem    */   --space-10  /* 2.5rem  */
--space-12  /* 3rem    */   --space-16  /* 4rem    */
--space-20  /* 5rem    */   --space-24  /* 6rem    */
```

Note there is no `--space-7`, `--space-9`, etc. — the scale skips some values intentionally.

### Semantic color tokens

These are what you should use in components. They change meaning per-theme:

```css
--color-bg        /* page background */
--color-text      /* primary text */
--color-accent    /* accent/highlight color */
--color-surface   /* card/panel background */
--color-border    /* borders and dividers */
```

RGB channel variants for `rgba()` usage:

```css
--color-bg-rgb      /* R, G, B of --color-bg */
--color-accent-rgb  /* R, G, B of --color-accent */
```

Overlay tokens (use these for header, dropdown, and mobile nav backgrounds):

```css
--color-header-bg     /* rgba(bg, 0.85) */
--color-dropdown-bg   /* rgba(bg, 0.92) */
--color-mobile-bg     /* rgba(bg, 0.95) */
--color-accent-tint   /* rgba(accent, 0.15) */
--color-accent-shadow /* rgba(accent, 0.15) */
```

### CCA brand palette

These are fixed color values — they don't change per theme. Use them for decorative elements, illustrations, or when you need a specific brand color regardless of context:

```css
--color-teal       /* #00BFB3 */
--color-yellow     /* #FFC845 */
--color-lime       /* #B7BF10 */
--color-pink       /* #F1BDC8 */
--color-orange     /* #E57200 */
--color-purple     /* #563D82 */
--color-navy       /* #005776 */
--color-sand       /* #F7F3E9 */
--color-dark-teal  /* #002f40 */
```

Celebration aliases (semantic wrappers around brand colors):

```css
--color-celebration-primary    /* teal */
--color-celebration-secondary  /* purple */
--color-celebration-warm       /* yellow */
--color-celebration-energy     /* orange */
--color-celebration-deep       /* navy */
```

### Gradients

```css
--gradient-prismatic  /* teal → purple → orange, animated angle */
--gradient-hero       /* dark navy → deep purple */
--gradient-gold       /* yellow → orange */
--theme-gradient      /* per-theme gradient, changes with active theme */
```

### Shape, elevation, and motion

```css
--radius-card   /* 6px */
--radius-sm     /* 4px */

--shadow-card-rest   /* subtle resting elevation */
--shadow-card-hover  /* pronounced hover elevation */

--ease-out-expo       /* cubic-bezier(0.16, 1, 0.3, 1) */
--ease-in-out-quint   /* cubic-bezier(0.76, 0, 0.24, 1) */
--ease-spring         /* cubic-bezier(0.34, 1.56, 0.64, 1) */

--duration-fast   /* 150ms */
--duration-base   /* 250ms */
--duration-slow   /* 400ms */
```

### Grid

```css
--grid-columns    /* 12 */
--grid-gutter     /* clamp(1rem, 2vw, 2rem) */
--container-max   /* 1400px */
```

## Fluid type

The type scale uses `clamp()` so every size responds to viewport width automatically. For example:

```css
--text-base: clamp(1rem, 0.93rem + 0.36vw, 1.25rem);
```

This means `--text-base` is `1rem` at the smallest viewport, scales fluidly, and caps at `1.25rem` at large viewports. Every step in the scale (`--text-xs` through `--text-5xl`) works the same way.

**Rule: never hardcode `px` font sizes.** Use the scale tokens — you get responsive type for free.

## Theme system

The active theme is controlled by a `data-theme` attribute on the `<html>` element. Themes are defined in `src/styles/themes.css` as attribute selectors:

```css
[data-theme="commencement"] {
  --color-bg: #0C2340;
  --color-accent: #3DD6C9;
  /* ... overrides the full token set */
}
```

### Available themes

| Theme key | Description |
|---|---|
| *(none / default)* | Warm off-white, teal accent — used for most pages |
| `commencement` | Dark navy, teal accent, gold shimmer |
| `showcase` | Dark navy, lime accent |

In `EventLayout`, pass the `themeKey` from the event's data:

```astro
<EventLayout themeKey={event.data.themeKey}>
```

`BaseLayout` sets `data-theme={themeKey}` on `<html>`. Components don't need to know which theme is active — they just use the semantic tokens (`--color-bg`, `--color-accent`, etc.) and the theme handles the rest.

### Adding a new theme

Add a `[data-theme="your-key"]` block to `src/styles/themes.css`. The comment block in the file lists all required tokens:

- Core palette: `--color-bg`, `--color-text`, `--color-accent`, `--color-surface`, `--color-border`
- RGB channels: `--color-bg-rgb`, `--color-accent-rgb`
- Overlays: `--color-header-bg`, `--color-dropdown-bg`, `--color-mobile-bg`
- Tints: `--color-accent-tint`, `--color-accent-shadow`
- Gradients: `--theme-gradient`
- Shimmer: `--color-shimmer-base`, `--color-shimmer-highlight`, `--color-shimmer-warm`
- Scheme: `--theme-scheme` (`light` or `dark`)
- Shape: `--radius-card`, `--radius-sm`
- Elevation: `--shadow-card-rest`, `--shadow-card-hover`

## Scroll-reveal system

`src/scripts/scroll-reveal.ts` runs an `IntersectionObserver` that watches for elements with reveal classes and adds `.is-visible` when they enter the viewport. No JavaScript is required in your component — just add a class.

### Available classes

| Class | Animation |
|---|---|
| `.reveal` | Fade in from slightly below |
| `.reveal-scale` | Fade in with scale-up |
| `.reveal-left` | Slide in from the left |
| `.reveal-right` | Slide in from the right |
| `.reveal-clip` | Clip-path reveal (wipe in) |

Usage:

```html
<section class="content-section reveal">
  <h2>About This Exhibition</h2>
  <p>...</p>
</section>
```

### Staggered grid children

When reveal elements are inside a grid container, they get stagger delay classes applied automatically. The container must have one of these classes:

- `.grid-cards`
- `.grid`
- `.bento-grid`

Children that are `.reveal` elements get `.stagger-1` through `.stagger-8` added in order as they enter the viewport. The CSS in `src/styles/animations.css` defines the delay for each stagger class.

```html
<div class="grid-cards">
  <div class="card reveal">Card 1 — gets stagger-1</div>
  <div class="card reveal">Card 2 — gets stagger-2</div>
  <div class="card reveal">Card 3 — gets stagger-3</div>
</div>
```

### Accessibility

The observer automatically checks `prefers-reduced-motion`. If the user has requested reduced motion, all reveal elements get `.is-visible` immediately — no animation plays.

### View Transitions compatibility

The observer runs on both `DOMContentLoaded` (initial load) and `astro:page-load` (after Astro View Transitions navigation). Reveal elements on navigated-to pages animate correctly without any extra setup.
