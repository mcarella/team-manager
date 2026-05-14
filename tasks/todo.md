# TODO — Forma 3-Layer Pipeline

> Compact task list. Full plan: `tasks/plan.md`.
> **Content scope:** EN-only ships now; i18n architecture supports adding any locale later as a content-only drop.
> **Layer 2 naming:** "Behavioral Core" (not PI — our own implementation, items in `docs/references/index/assessment-mock.jsx`).
> **References:** instrument items, scoring formulas, and content are in `docs/references/index/*`. Tasks below cite specific files. **Copy from them; don't invent.**

## Phase 1 — Foundation
- [x] **T1** [M] i18n scaffolding — i18next wired, `locales/en/common.json` only, language toggle hidden until 2+ locales registered
- [x] **T2** [S] Forma design tokens — extract from `docs/forma-v2.html` to Tailwind preset

### ✅ Checkpoint A — Foundation green (reached)

## Phase 2 — Layer 1 Reframe (vertical slice)
- [x] **T3** [S] Layer 1 copy reframe — Goleman primary, archetype secondary, EN via `t()`
- [x] **T4** [S] Time-budget chip + "deeper read" CTA

### ✅ Checkpoint B — Layer 1 ships (reached — valid stopping point #1)

## Phase 3 — Layer 2 Behavioral Core (vertical slice)
- [x] **T5** [XS] Domain types — `BehavioralCoreFactors`, `GolemanRadar`, `BehavioralCoreSubProfile` (17, includes Camaleonte), `BehavioralCoreAnswers`, `BehavioralCoreAssessment`
- [x] **T6** [M] Behavioral Core scoring engine `behavioral-core.ts` — TDD, 18 tests green
- [x] **T7** [S] Behavioral Core API route `POST /assessments/behavioral-core` — TDD, 6 tests green
- [x] **T8** [M] Layer 2 UI flow — two-pass at `/assessment/layer-2`, radar + sub-profile result, 86 adjective labels + 17 sub-profile names/descriptions in `layer2.json`
- [x] **T9** [S] Cross-link Layer 1 ↔ Layer 2 — callout on result + inline prompt when L1 missing

### ✅ Checkpoint C — Layer 2 ships (reached — valid stopping point #2)

## Phase 4 — Layer 3 Saboteur Personal (vertical slice)
- [ ] **T10** [M] Saboteur static data — lift 10 saboteurs + 5 sage powers verbatim from `docs/references/index/mental-fitness-assessment.jsx` + `saboteur-implementation-plan.md`; Shadow table from `docs/ideas/leadership-profile-expansion.md` §4
- [ ] **T11** [M] Saboteur scoring engine `saboteur.ts` — TDD. Formulas from `saboteur-implementation-plan.md` §4; items from `mental-fitness-assessment.jsx` lines 26-80
- [ ] **T12** [S] PQ scoring `computePQScore` + `interpretPQ` — TDD. 5-band thresholds (<50, 50-65, 65-75, 75-85, ≥85) from `saboteur-implementation-plan.md` §4.2
- [ ] **T13** [S] Saboteur API route `POST /assessments/saboteur` — TDD
- [ ] **T14** [M] Layer 3 assessment UI — 50 Likert + 24 PQ emotion pairs (two-column), shape from `mental-fitness-assessment.jsx` lines 165-435
- [ ] **T15** [L] Personal coaching report (on-screen) — radar, PQ gauge with tipping marker, top-3 cards, **age-banded PQ benchmark table**, sage powers, action plan, Cynefin callout. Visual spec: `assessment-output-report.pdf` pp.1-9

> **Parked (post-v1):** PDF export of the coaching report. Visual spec exists; library/chart-bridge decisions deferred.

### ✅ Checkpoint D — Layer 3 personal ships (valid stopping point #3)

## Phase 5 — Team-fit
- [ ] **T16** [S] Team-fit scoring `saboteur-team-fit.ts` — TDD. Pure radar math: distance, per-axis variance, high-overlap pairs, relation classifier (amplifying/balancing/neutral). Mirrors `aggregatePeerLeadershipAssessments` / `computeKiviatData` patterns.
- [ ] **T17** [S] Team-fit API route `GET /assessments/saboteur/:userId/team-fit/:teamId`
- [ ] **T18** [M] Team-fit manager UI — clash matrix + distribution chart

### ✅ Checkpoint E — Team-fit ships

## Phase 6 — Persistence (Infra, can parallelize with Phase 1+)
- [ ] **T20** [M] Drizzle schema + initial migration. Adapt Prisma sketch from `docs/references/index/implementation-plan.md` lines 89-127
- [ ] **T21** [M] Migrate all API routes off in-memory stores
- [ ] **T22** [S] Unified profile endpoint `GET /profile/:userId`

### ✅ Checkpoint F — Full pipeline persistent

---

## Open Questions

### Resolved by references
- ~~PI instrument source~~ → Forma's own 86-adjective bank
- ~~16 vs 17 sub-profiles~~ → 17 (Camaleonte included)
- ~~Layer 1 reframe scope~~ → done in Phase 2, visible in browser
- ~~Peer-assessed Saboteur~~ → self-only
- ~~DB: Postgres vs Supabase~~ → Drizzle (stays as-is)
- ~~Saboteur clash rules~~ → not rules; radar comparison via vector distance (same pattern as CVF/leadership)

### Still open
- [ ] Single-vs-distribution Drives→Archetype — UI projection question (forks T8). Defer.

### Parked (post-v1)
- PDF export of the Layer 3 coaching report
