---
title: Deployment
description: Build process, changing the active phase, and what a site deployment looks like for CCA 2026
section: ops
order: 1
---


## Build process

This is a fully static Astro site built into a Docker container and served by nginx on Cloud Run.

The Dockerfile is a two-stage build:
- **Stage 1 (builder)** — `oven/bun:alpine` installs dependencies and runs `bun run build`, producing `./dist/`
- **Stage 2 (serve)** — `nginx:alpine` copies `dist/` and serves it on port 8080

The build validates all content JSON against Zod schemas, type-checks all `.astro` and `.ts` files, generates static HTML for every route, optimizes images with Sharp, and bundles client-side scripts. If any step fails, the build fails and should not be deployed.

## Before deploying to production

Run these checks locally before tagging a production release:

```sh
bunx astro check   # type-check .astro files
bun run build      # full production build
bun run preview    # visually verify key pages
```

Key pages to check:
- `/` — landing page with bento grid
- `/docs/` — docs hub (especially after adding new docs)
- Any event page that was recently updated
- Any phase-gated section that just became visible

## Build triggers

Two Cloud Build triggers control when deployments fire — no manual deploys needed.

### Staging

**Trigger:** any push to a branch matching `staging/*`

The current branch (`staging/pre-event-phase`) follows this pattern. Push to any `staging/*` branch and a build kicks off automatically. Use staging to verify content changes, phase advances, or visual updates before tagging a production release.

```sh
git push origin staging/my-branch   # triggers a staging build
```

### Production

**Trigger:** a version tag matching `v*` pushed to the repo

To deploy to production, tag a commit and push the tag:

```sh
git tag v1.2.0
git push origin v1.2.0   # triggers a production build
```

Use semantic versioning. Tag on `main` after staging has been verified.

## Environment

This site has no environment variables and no server-side secrets. Everything is static and public. The GTM container ID (`GTM-5CZR96`) is hardcoded in `BaseLayout.astro` — that's intentional and not a secret.
