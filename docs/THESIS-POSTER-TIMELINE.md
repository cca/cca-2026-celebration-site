# CCA 2026 Celebration Site — Thesis Page Phase & Poster Timeline

**Prepared for:** Tanza
**Scope:** PRs #13–#30 (late April – mid May 2026)
**Question answered:** When/why did `2026.cca.edu/thesis/` change, and specifically when did the exhibition poster appear and later revert?

---

## Key concept
The `/thesis/` page appearance is controlled by one site-wide variable, `CURRENT_PHASE`
in `src/config/phases.ts`. The exhibition poster (`/images/thesis/poster.png`) renders
**only in the `during-event` phase**; in `pre-event` the page shows a When/Where sidebar
instead (`src/pages/thesis/index.astro:178-197`).

Only three PRs changed that variable — those are the only ones that flipped the poster.
Everything else was content/layout work that inherited whatever phase was active.

## Production timeline (merges to `main`), all times PDT

| Merged | PR | Author | Merged by | Phase after | Poster |
|---|---|---|---|---|---|
| Apr 30, 3:56 PM | #13 event image refactor | nikolplass | tanza-s | pre-event | hidden |
| May 4, 9:35 AM | #14 commencement consolidation | nikolplass | tanza-s | pre-event | hidden |
| May 5, 10:00 AM | #15 bento auto-flow / "PAST EVENT" | nikolplass | tanza-s | pre-event | hidden |
| May 7, 1:21 PM | #17 extension banner update | nikolplass | tanza-s | pre-event | hidden |
| **May 12, 10:23 AM** | **#16 → during-event** | **nikolplass** | **tanza-s** | **during-event** | **SHOWN** |
| May 12, 1:52 PM | #18 commencement redesign | nikolplass | tanza-s | during-event | shown |
| **May 13, 3:30 PM** | **#20 → pre-event (REVERT)** | **tanza-s** | **tanza-s** | **pre-event** | **HIDDEN** |
| May 14, 1:15 PM | #19 speaker images | nikolplass | tanza-s | pre-event | hidden |
| May 14, 1:15 PM | #21 temp-remove sections | nikolplass | tanza-s | pre-event | hidden |
| **May 15, 3:43 PM** | **#29 → during-event** | **tanza-s** | **tanza-s** | **during-event** | **SHOWN** |
| May 16, 9:51 AM | #30 honoree titles | nikolplass | tanza-s | during-event | shown |

**Staging line only** (`staging/during-event-changes`, rolled into prod via #29):
#24, #25, #26, #28 (all May 15). **Never merged:** #22, #23 (draft), #27.

## Why #17 merged before #16 (despite the lower number)
PR numbers reflect *creation* order, not *merge* order.
- #16 (the phase "knob") was created May 5, 2:14 PM but intentionally held ~7 days, merged May 12.
- #17 (small 3-file banner fix) was created May 6 and merged the next day, May 7.

Because #16 was still unmerged on May 7, the site was `pre-event` during #17's QA — so the
poster was correctly not visible then.

## The poster's lifecycle (verified against production via Wayback Machine)
- **On:** #16 flipped phase to during-event (May 12). Poster confirmed live in the
  Wayback capture of **May 13, 2:44 PM**.
- **Off (revert):** #20 flipped phase back to pre-event (May 13, 3:30 PM). Reverted page
  confirmed live in the Wayback capture of **May 14, 11:08 AM**.
- **On again:** #29 flipped phase to during-event (May 15, 3:43 PM).

## Bottom line
- The poster displaying was **intended** behavior of the `during-event` phase, not a bug.
- The forward move (#16) was authored by Nikol, merged by Tanza.
- The **revert** that put the old thesis content back (#20) was authored **and** merged by Tanza.
- Production deploys are manual; the person who clicked the production build button is only
  recorded in the production GCP project's Cloud Build log (not in the data reviewed here).
