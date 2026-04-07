---
title: Asset Pipeline
description: Photo handling, naming conventions, image optimization, and the SVG frame system for CCA 2026
section: workflow
order: 2
---


## Where photos live

All photos are in `public/images/cca-photography/`. Files in `public/` are served as-is at the root URL — a file at `public/images/cca-photography/jane-doe.jpg` is accessible at `/images/cca-photography/jane-doe.jpg`.

## Naming conventions

Use lowercase kebab-case. Name files after their subject:

```
public/images/cca-photography/
├── jane-doe.jpg              # student portrait
├── bfa-senior-exhibitions-01.jpg  # event photo, numbered
├── vcs-symposium-gallery-01.jpg   # gallery photo with index
└── commencement-2026-hero.jpg     # hero/hero image
```

Rules:
- All lowercase, no spaces
- Hyphens between words
- Include a number suffix when there are multiple photos of the same subject
- Keep filenames descriptive enough to identify without opening the file

## Image optimization

Astro uses [Sharp](https://sharp.pixelplumbing.com/) for image optimization. Images referenced via the Astro `<Image />` component or `getImage()` are automatically:
- Resized to the requested dimensions
- Converted to WebP format
- Served with appropriate cache headers

For images referenced as plain strings in JSON content (student photos, event images), optimization happens at the component level. Components like `EventHero` and student profile pages use the Astro `<Image />` component internally.

**Remote images from `cca.edu`** — these are allowed in `astro.config.mjs` via `remotePatterns`. You can use `https://www.cca.edu/...` image URLs directly in content files.

## Adding new photos to the demo page

`src/pages/demo/photography.astro` is an asset inventory page that lists all images used across the site. When you add new photos, add their filenames to the `ccaPhotography` array at the top of that file.

## The frame system

Event hero images can use SVG clip-mask frames. Frames live in `public/images/scanned-graphics/frames/` as `frame-01.svg` through `frame-23.svg`.

To use a framed hero image, set `heroImages` (not `image`) in the event's JSON:

```json
"heroImages": [
  {
    "src": "/images/cca-photography/event-photo.jpg",
    "alt": "Students celebrating at the event",
    "frameId": "frame-04"
  }
]
```

Frame IDs run from `frame-01` to `frame-23`. Browse them at `public/images/scanned-graphics/frames/` — each is a unique scanned hand-drawn border shape.

To use a plain unframed image instead, use the `image` field:

```json
"image": {
  "src": "/images/cca-photography/event-poster.jpg",
  "alt": "Event poster",
  "aspectRatio": "4/5",
  "heroOnly": true
}
```

`heroOnly: true` prevents the image from appearing in other contexts (event cards, etc.). `aspectRatio` controls the hero image container aspect ratio.

Both fields are handled by `src/components/events/EventHero.astro`. If neither is set, the hero renders with no image.

## Photo galleries on thesis pages

Some thesis event pages include a photo gallery section. These are implemented directly in the page `.astro` file — not a shared component — as:

```astro
<section class="gallery-section">
  <div class="gallery-grid">
    <div class="gallery-item gallery-item--featured">
      <img src="/images/cca-photography/event-01.jpg" alt="..." />
    </div>
    <div class="gallery-item">
      <img src="/images/cca-photography/event-02.jpg" alt="..." />
    </div>
  </div>
</section>
```

The first item gets `.gallery-item--featured` (spans 2 columns, 16:9 ratio). Remaining items use 4:3. Look at Architecture Studio Conversations or VCS Symposium pages for reference implementations with the full scoped CSS.

## SVG decorative assets

`public/images/scanned-graphics/` also contains decorative hand-drawn elements used across the site (arrows, textures, marks). These are referenced directly as `<img>` tags in components. Do not edit or replace them — they are part of the visual identity.
