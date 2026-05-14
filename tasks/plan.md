# Implementation Plan — Forma 3-Layer Pipeline

> Source spec: `/Users/matt/.claude/plans/reflective-wishing-umbrella.md`
> Conceptual brief: `/Users/matt/Downloads/product-expansion-brief.md`
> Existing companion doc: `docs/ideas/leadership-profile-expansion.md`

## Overview

Expand the existing team-manager app from a single Goleman/ORGANIC assessment into a **3-layer causal pipeline**:

1. **Layer 1** (3 min) — Goleman quick-read (reframes existing OA assessment).
2. **Layer 2 — Behavioral Core** (10 min) — stable behavioral drives → Goleman radar refinement. **New.**
3. **Layer 3 — Saboteur Radar** (15 min) — personal coaching view + team-fit/compatibility view. **New.**

Each layer is a valid standalone stopping point. The pipeline is causal: Behavioral Core → workplace identity → Goleman archetype → filtered by Saboteur.

## References (source of truth)

The owner has assembled a set of authoritative references in `docs/references/` and `docs/references/index/`. Tasks below cite them by file. **Copy from these; do not invent equivalents.**

| File | What it gives us | Used by |
|---|---|---|
| `docs/references/index/archetypes-reference-guide.pdf` (32p) | 17 sub-profile cards with factor centroids (D/E/P/F 0-100), strengths, cautions, ideal environment, communication style, typical roles. EN+IT copy ready. | T10 (sub-profile data) |
| `docs/references/index/assessment-mock.jsx` (705 LOC) | Working Layer 2 implementation: 86 adjectives × {factor, weight, EN/IT}, two-list flow (Self-Concept + Self), sigmoid-normalize 1-5 → 0-100 | T6 (scoring), T8 (UI shape) |
| `docs/references/index/mental-fitness-assessment.jsx` (549 LOC) | Working Layer 3: 10 saboteurs × {icon, color, description, lie, original strength, sage antidotes}; 5 sage powers; 50 Likert items; 24 PQ pairs; scoring; PQ gauge | T10, T11, T12, T14, T15 |
| `docs/references/index/assessment-output-report.pdf` (12p) | Layer 3 final-report visual spec: cover, 10-axis radar, top-3 saboteur cards, PQ gauge with age benchmark, sage powers, action plan | T15 (on-screen + new PDF export) |
| `docs/references/index/saboteur-implementation-plan.md` (1100 LOC) | Scoring pseudocode, item weights, reverse-scoring flags, saboteur→sage map, PQ thresholds (<50/50-65/65-75/75-85/85+) | T11, T12 |
| `docs/references/index/pq-implementation-plan.md` (1100 LOC) | Age-banded PQ benchmarks (18-25: 51, 26-35: 54, 36-45: 57, 46-55: 59, 56-65: 61, 65+: 63) | T15 (benchmark section) |
| `docs/references/index/implementation-plan.md` (566 LOC) | Prisma schema sketch for all three layers' DB tables | T20 (Drizzle schema design) |
| `docs/references/leadership_that_gets_results.pdf` | Goleman's HBR paper — canonical for the 6 styles | T3 copy (already done) |

**Implication:** the plan shifts from ~40% stub content to ~85% concrete spec. The "PI instrument source" question is resolved (the 86-adjective Forma Drives bank is our own, in the references). Item counts, scoring formulas, and content all have source.

## Architecture Decisions

- **Vertical slicing**: each phase delivers a working user-facing path end-to-end (types + scoring + API + UI), not horizontal layers.
- **Foundations are thin**: i18n + Forma tokens land in Phase 1 just enough to unblock Layer 1 — no big-bang infra.
- **Persistence deferred to Phase 6**: existing Zustand+localStorage carries Layers 1-3 through dev. Drizzle cut-over is its own infra phase, isolated from feature work.
- **Single-vs-distribution Drives→Archetype question (from brief) is NOT resolved**: scoring stores the full `GolemanRadar` distribution under the hood; UI provides both "dominant" and "radar" projections via separate components. Every fork is tagged `// DESIGN-Q: single-vs-distribution`.
- **Layer 1 reconciliation**: keep ORGANIC archetype scoring as-is (tested + Shadow Saboteur table is keyed on archetype), promote Goleman style to primary UI output. No new scoring instrument for Layer 1.
- **EN-only content, multilingual-ready architecture**: i18next is wired and ALL new copy is authored through `t(...)` calls, but only `en/*.json` locale files are shipped now. Adding a second locale later is a pure content drop — no code changes required. The `<LanguageToggle />` auto-hides while only one locale is available and auto-appears when a second one is added.
- **Layer 2 is not PI**: the behavioral instrument is our own implementation, similar in principle but not the proprietary PI Behavioral Assessment. Branded **Behavioral Core** end-to-end. Files: `behavioral-core.ts`. Types: `BehavioralCoreFactors`, `BehavioralCoreSubProfile`, `BehavioralCoreAssessment`. API: `/assessments/behavioral-core`. UI: `Layer2BehavioralCorePage`.
- **Layer 2 instrument shape**: 86 adjectives, two-pass flow ("how others expect you to be" + "who you really are"), sigmoid normalize 1-5 → 0-100 per factor. Source: `docs/references/index/assessment-mock.jsx`.
- **17 sub-profiles, not 16**: references include `Il Camaleonte` (50/50/50/50) as a distinct profile with its own narrative. Plan previously excluded it as "non-answer"; the references treat it as a legitimate balanced profile. **Reverting that exclusion** — include all 17.
- **Layer 3 PDF export — PARKED, out of v1 scope.** The 12-page mockup in `docs/references/index/assessment-output-report.pdf` remains the visual target for the *on-screen* view, but downloadable PDF generation is deferred. T15 stays as a single on-screen task; T15b removed.
- **Saboteur clash = radar comparison, not hand-authored rules.** Same pattern already used for CVF (`computeKiviatData`) and peer leadership (`aggregatePeerLeadershipAssessments`): pairwise vector distance + per-axis variance + dominant-axis flagging. No clash matrix to author. Phase 5 unblocked.
- **Layer 3 includes age-banded PQ benchmark**: the report shows the user's PQ score against age-band averages (4 bands, source: `pq-implementation-plan.md`). Added to T15a scope.
- **TDD classification per existing CLAUDE.md**: scoring/API tasks = `logic` (full RED→GREEN); UI tasks = `ui` (skip-tests, visual review).

## Dependency Graph

```
i18n scaffolding ──┐
                   ├──> Layer 1 reframe ──> Layer 2 cross-link
Forma tokens ──────┘                       │
                                           │
Shared types (Core) ──> Core scoring ──> Core API ──> Core UI ──> Layer 2 ships
                                                                 │
                                                                 ▼
Shared types (Sab) ──> Saboteur scoring ──> Saboteur API ──> Saboteur UI ──> Layer 3 personal ships
                                                                              │
                                            Owner authors clash rules ────────┤
                                                          │                   │
                                                          ▼                   ▼
                                              Team-fit scoring ──> Team-fit API ──> Team-fit UI ──> Layer 3 team-fit ships
                                                                                                    │
                                                                                                    ▼
                                                                                  Drizzle schema ──> Migrate routes ──> Unified profile endpoint
```

---

## Task List

### Phase 1 — Foundation (thin, unblock Layer 1)

#### Task 1: i18n scaffolding (EN-only, multilingual-ready)
**Description:** Wire `i18next` + `react-i18next` into the web app with `en` as the only initial namespace. Author all new copy through `t(...)` calls. Build a `<LanguageToggle />` component that auto-hides when only one locale is registered and auto-appears when a second is added — so today the toggle is invisible, but the moment we drop an `it/` folder (or any other locale) into `apps/web/src/locales/`, the switcher appears with no code change. Migrate ONE existing page's strings (HomePage) as proof-of-shape.

**Acceptance criteria:**
- [ ] `i18next` + `react-i18next` installed in `apps/web`.
- [ ] Locale file at `apps/web/src/locales/en/common.json` exists with at least 5 shared keys. No `it/` directory authored at this point.
- [ ] `<LanguageToggle />` component exists and conditionally renders based on `i18n.options.supportedLngs.length > 1`.
- [ ] `HomePage` renders all visible strings via `t(...)`.
- [ ] Active locale persists in localStorage.
- [ ] Documented: how a translator can add a new locale by dropping `apps/web/src/locales/<lang>/*.json` files — no code change required.

**Verification:**
- [ ] `pnpm typecheck && pnpm lint && pnpm test` passes (existing 50 tests).
- [ ] Manual: open HomePage in browser, confirm strings render through i18n; toggle is not visible.
- [ ] Local-dev smoke: add a stub `it/common.json` with one key translated, restart, confirm toggle appears and switches to IT. Revert.

**Dependencies:** None.

**Files likely touched:**
- `apps/web/package.json`
- `apps/web/src/i18n.ts` (new)
- `apps/web/src/locales/en/common.json` (new)
- `apps/web/src/components/LanguageToggle.tsx` (new)
- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/main.tsx`

**Estimated scope:** M (5 files)

---

#### Task 2: Forma design tokens
**Description:** Extract color palette, typography scale, and spacing tokens from `docs/forma-v2.html` into a Tailwind preset (or CSS custom properties). Wire base layout to consume them. Do not restyle existing pages — just expose the tokens.

**Acceptance criteria:**
- [ ] Forma tokens exist at `apps/web/src/styles/forma-tokens.css` (or `tailwind.preset.forma.cjs`).
- [ ] Token set covers: primary/secondary/accent colors, neutral scale, body/heading font, baseline spacing scale.
- [ ] Root layout consumes tokens (background, body text color, base font).
- [ ] No existing page visually regresses.

**Verification:**
- [ ] `pnpm build` succeeds.
- [ ] Manual: open `/` and confirm the brand kit's primary color is visible on body/text.

**Dependencies:** None.

**Files likely touched:**
- `apps/web/src/styles/forma-tokens.css` (new)
- `apps/web/tailwind.config.ts` or `tailwind.preset.forma.cjs` (new)
- `apps/web/src/index.css`

**Estimated scope:** S (2-3 files)

---

### ✅ Checkpoint A — Foundation
- [ ] Tests pass, typecheck clean, build clean.
- [ ] i18n wired; HomePage strings go through `t()`; toggle hidden today.
- [ ] Forma tokens visible on root layout.
- [ ] Review with human before proceeding.

---

### Phase 2 — Layer 1 Reframe (vertical slice: Goleman-first quick-read)

#### Task 3: Layer 1 copy reframe to Goleman-primary
**Description:** Rewrite the "mine" tab of `LeadershipAssessmentPage` so the user-facing headline is the dominant Goleman style (e.g., "Right now, you're leading **Coaching**-first"), with the ORGANIC archetype demoted to a secondary line. Use Forma tone-of-voice guidance: precise, analytical, confident, human; no "empower/unlock/transform". Author copy in EN, through `t()`.

**Acceptance criteria:**
- [ ] `LeadershipAssessmentPage` "mine" tab leads with Goleman style.
- [ ] ORGANIC archetype appears as secondary attribute, not the headline.
- [ ] All new strings exist in `locales/en/layer1.json` and are rendered via `t()`.
- [ ] No change to scoring functions in `packages/team-manager-core/src/leadership.ts`.

**Verification:**
- [ ] Existing leadership tests still green (`pnpm --filter @team-manager/core test`).
- [ ] Manual: complete the 12-question assessment, confirm result header is Goleman, secondary is archetype.

**Dependencies:** Task 1.

**Files likely touched:**
- `apps/web/src/pages/LeadershipAssessmentPage.tsx`
- `apps/web/src/components/ArchetypeCard.tsx` (rename or duplicate to `GolemanPrimaryCard.tsx`)
- `apps/web/src/locales/en/layer1.json` (new)

**Estimated scope:** S (3 files)

---

#### Task 4: Time-budget chip + "deeper read" CTA
**Description:** Add a UX-contract chip showing elapsed/budget time (3 min for Layer 1) at the top of the assessment flow. After completion, show a clear "Want the deeper read? Take Layer 2 (10 min)" CTA pointing to the Layer 2 page (which doesn't exist yet — link to a placeholder route).

**Acceptance criteria:**
- [ ] `<TimeBudgetChip budgetMinutes={3} />` component exists, renders elapsed time, color-codes when over budget.
- [ ] Layer 1 result page shows the "deeper read" CTA.
- [ ] CTA route is `/assessment/layer-2` (404 placeholder OK for now).

**Verification:**
- [ ] Manual: start the assessment, see the chip tick. Finish, see the CTA.
- [ ] CTA navigates to `/assessment/layer-2` (404 is fine until Task 8).

**Dependencies:** Task 3.

**Files likely touched:**
- `apps/web/src/components/TimeBudgetChip.tsx` (new)
- `apps/web/src/pages/LeadershipAssessmentPage.tsx`

**Estimated scope:** S (2 files)

---

### ✅ Checkpoint B — Layer 1 ships (valid stopping point #1)
- [ ] User can complete a 3-minute Layer 1 assessment in EN.
- [ ] Result page leads with Goleman style, references ORGANIC archetype secondarily.
- [ ] "Deeper read" CTA visible.
- [ ] All existing tests still green.
- [ ] Review with human before Phase 3.

---

### Phase 3 — Layer 2 Vertical Slice (Behavioral Core)

> Throughout this phase, `BehavioralCore*` types replace the brief's "PI" terminology. Files use `behavioral-core.ts`. The instrument is our own implementation, similar in principle to PI Behavioral but original.

#### Task 5: Behavioral Core domain types
**Description:** Add `BehavioralCoreFactors`, `GolemanRadar`, `BehavioralCoreSubProfile`, `BehavioralCoreAssessment` to `packages/shared/src/types.ts`. The four factors are `dominance`, `extraversion`, `patience`, `formality` (English names; replace the Italian `dominanza/estroversione/pazienza/formalita` used in older docs).

**Acceptance criteria:**
- [ ] `BehavioralCoreFactors`, `GolemanRadar`, `BehavioralCoreSubProfile`, `BehavioralCoreAssessment` defined.
- [ ] `GolemanRadar` is `Record<GolemanStyle, number>` (0-100 each).
- [ ] `BehavioralCoreSubProfile` is a string union of 17 sub-profile IDs matching the references (ricercatore, direttore, esperto, visionario, pioniere, armonizzatore, capitano, mediatore, ribelle, persuasore, ambasciatore, camaleonte, artigiano, guardiano, operatore, individualista, studioso).
- [ ] Exported from `@team-manager/shared`.

**Verification:**
- [ ] `pnpm --filter @team-manager/shared build` succeeds.
- [ ] `pnpm typecheck` across the monorepo passes.

**Dependencies:** None.

**Files likely touched:**
- `packages/shared/src/types.ts`
- `packages/shared/src/index.ts`

**Estimated scope:** XS (1 file)

---

#### Task 6: Behavioral Core scoring engine (TDD, `logic`)
**Description:** Implement `packages/team-manager-core/src/behavioral-core.ts`. The instrument is 86 adjectives in two passes (Self-Concept + Self), each 1-5 Likert. Lift the scoring algorithm verbatim from `docs/references/index/assessment-mock.jsx` (the `ADJECTIVES` array + `computeFactorScores()` function). Functions to export: `computeBehavioralCoreFactors(answers)` (raw → 0-100 per factor via sigmoid normalize), `computeGolemanRadar(factors)` (6 affine rules from §3 of `docs/ideas/leadership-profile-expansion.md`), `matchSubProfile(factors)` (nearest-centroid against the 17 sub-profile centroids in `docs/references/index/archetypes-reference-guide.pdf`). Test-first.

**Acceptance criteria:**
- [ ] `computeBehavioralCoreFactors` returns `{dominance, extraversion, patience, formality}` each 0-100, using the sigmoid normalize from `assessment-mock.jsx`.
- [ ] `computeGolemanRadar` returns 6-axis radar 0-100 per Goleman style.
- [ ] `matchSubProfile` returns one of 17 sub-profile IDs (centroids lifted from the archetypes reference guide).
- [ ] Snapshot tests cover one canonical input per Goleman axis AND per sub-profile centroid (17 round-trip tests).
- [ ] Sub-profile match has boundary tests (closest-centroid tie-break documented).
- [ ] **DESIGN-Q comment** on `computeGolemanRadar` flags the single-vs-distribution decision.

**Verification:**
- [ ] `pnpm --filter @team-manager/core test` — new tests RED before impl, GREEN after.
- [ ] All existing 39+ core tests still green.

**Dependencies:** Task 5.

**Files likely touched:**
- `packages/team-manager-core/src/behavioral-core.ts` (new — scoring)
- `packages/team-manager-core/src/behavioral-core.test.ts` (new)
- `packages/team-manager-core/src/data/adjectives.ts` (new — 86-item bank lifted from `assessment-mock.jsx`)
- `packages/team-manager-core/src/data/sub-profiles.ts` (new — 17 centroids + EN copy lifted from `archetypes-reference-guide.pdf`)
- `packages/team-manager-core/src/index.ts`

**Estimated scope:** M (4 files)

---

#### Task 7: Behavioral Core API route (TDD, `logic`)
**Description:** New `apps/api/src/routes/behavioral-core.ts` exposing `POST /assessments/behavioral-core` with Zod validation. Mirror the existing `assessments.ts` pattern. In-memory store for now (mark `// will be replaced by DB` per convention).

**Acceptance criteria:**
- [ ] `POST /assessments/behavioral-core` accepts `{userId, answers: number[]}`, returns `BehavioralCoreAssessment`.
- [ ] Invalid input returns 400 with Zod error.
- [ ] Mounted in `apps/api/src/app.ts`.
- [ ] Unit tests cover happy path + invalid input.

**Verification:**
- [ ] `pnpm --filter @team-manager/api test` green.
- [ ] `curl -X POST localhost:3000/assessments/behavioral-core -d '{...}'` returns expected payload.

**Dependencies:** Task 6.

**Files likely touched:**
- `apps/api/src/routes/behavioral-core.ts` (new)
- `apps/api/src/routes/behavioral-core.test.ts` (new)
- `apps/api/src/app.ts`

**Estimated scope:** S (2-3 files)

---

#### Task 8: Layer 2 Behavioral Core UI flow
**Description:** New page `Layer2BehavioralCorePage.tsx` at `/assessment/layer-2`. Two-pass flow per `docs/references/index/assessment-mock.jsx`: (1) Self-Concept pass — "How do others expect you to behave?", (2) Self pass — "How do you really behave?". 10-min time-budget chip. Result card with Goleman radar (Recharts) + sub-profile flavor card. Reuse the JSX's `<LikertScale />` + `<ProgressBar />` + question-grid patterns. Strings authored in EN via `t()`; the 86 adjectives have EN labels in `assessment-mock.jsx` ready to lift.

**Acceptance criteria:**
- [ ] Route `/assessment/layer-2` registered in `App.tsx`.
- [ ] Form submission calls `POST /assessments/behavioral-core`.
- [ ] Result page renders 6-axis Goleman radar (reuse `CVFRadarChart` pattern).
- [ ] Sub-profile name + flavor text rendered.
- [ ] `<DominantStyleHeadline />` companion shown above radar (single-dominant projection).
- [ ] All strings in `locales/en/layer2.json`.

**Verification:**
- [ ] Manual: complete Layer 2 in browser, time it (must be ~10 min with placeholder items).
- [ ] Radar renders; sub-profile flavor card visible.

**Dependencies:** Task 7.

**Files likely touched:**
- `apps/web/src/pages/Layer2BehavioralCorePage.tsx` (new)
- `apps/web/src/components/BehavioralCoreForm.tsx` (new)
- `apps/web/src/components/BehavioralCoreRadarCard.tsx` (new)
- `apps/web/src/components/DominantStyleHeadline.tsx` (new)
- `apps/web/src/locales/en/layer2.json` (new)
- `apps/web/src/App.tsx`
- `apps/web/src/store/index.ts` (add `behavioralCore` slice)

**Estimated scope:** M (5-7 files) — UI heavy, `skip-tests`

---

#### Task 9: Cross-link Layer 1 ↔ Layer 2
**Description:** On the Layer 2 result page, render a "Your natural club from the 3-min read was **{Goleman style}**" reference pulled from the Layer 1 result in the store. This honors the causal-pipeline guardrail (Layer N references Layer N-1).

**Acceptance criteria:**
- [ ] Layer 2 result reads Layer 1's stored Goleman style.
- [ ] If user hasn't taken Layer 1, show inline prompt + link instead.
- [ ] "Compare your radar to your Layer 1 archetype" tooltip with one-sentence explanation.

**Verification:**
- [ ] Manual: take Layer 1, then Layer 2 — confirm Layer 1 reference appears on Layer 2.
- [ ] Manual: clear localStorage, take only Layer 2 — confirm "take Layer 1 first" prompt appears.

**Dependencies:** Task 8.

**Files likely touched:**
- `apps/web/src/pages/Layer2BehavioralCorePage.tsx`
- `apps/web/src/components/Layer1ReferenceCallout.tsx` (new)

**Estimated scope:** S (2 files)

---

### ✅ Checkpoint C — Layer 2 ships (valid stopping point #2)
- [ ] User can complete Layer 1 → Layer 2 in sequence, with Layer 2 referencing Layer 1's output.
- [ ] Behavioral Core radar and sub-profile flavor render correctly in EN.
- [ ] All tests green; typecheck and build clean.
- [ ] Review with human before Phase 4.

---

### Phase 4 — Layer 3 Personal Vertical Slice (Saboteur Radar)

#### Task 10: Saboteur static data (EN)
**Description:** **No authoring needed** — lift content verbatim from `docs/references/index/mental-fitness-assessment.jsx` (lines 4-23) and `docs/references/index/saboteur-implementation-plan.md` §2.1 (lines 475-590). Content is in Italian; translate to EN. 10 saboteurs × {id, icon, color hex, isUniversal, description, lie, originalStrength, sageAntidotes[]}; 5 sage powers × {id, icon, description, howToUse}; Shadow Saboteur table from `docs/ideas/leadership-profile-expansion.md` §4 (archetype → top saboteurs + coaching focus).

**Acceptance criteria:**
- [ ] `packages/team-manager-core/src/data/saboteurs.en.ts` exports 10 saboteurs × all fields, in EN.
- [ ] `packages/team-manager-core/src/data/sage-powers.en.ts` exports 5 sage powers × all fields, in EN.
- [ ] `packages/team-manager-core/src/data/shadow-saboteurs.ts` exports Shadow table keyed by archetype (language-agnostic identifiers + EN copy refs).
- [ ] Files are named `.en.ts` to signal locale-tagged content; adding `.it.ts` later is a content drop, no code change.
- [ ] All saboteur IDs match `SaboteurId` union.

**Verification:**
- [ ] `pnpm --filter @team-manager/core build` succeeds.
- [ ] Snapshot test: `Object.keys(saboteursEn).length === 10`.

**Dependencies:** None.

**Files likely touched:**
- `packages/shared/src/types.ts` (add `SaboteurId`, `SagePowerId`)
- `packages/team-manager-core/src/data/saboteurs.en.ts` (new)
- `packages/team-manager-core/src/data/sage-powers.en.ts` (new)
- `packages/team-manager-core/src/data/shadow-saboteurs.ts` (new)

**Estimated scope:** M (4 files, heavy on content)

---

#### Task 11: Saboteur scoring engine (TDD, `logic`)
**Description:** Implement `packages/team-manager-core/src/saboteur.ts`. Lift item bank + scoring formula from `docs/references/index/mental-fitness-assessment.jsx` (50 Likert items, lines 26-80) and `docs/references/index/saboteur-implementation-plan.md` §4 (lines 400-610). Exports: `computeSaboteurScores(answers)` — normalize formula `((raw - 1) / 4) * 10` per saboteur, with per-item `reverseScored` flag honored; `rankTopSaboteurs(scores)` (top 3, ties broken alphabetically); `recommendSagePowers(topSaboteurs)` (saboteur→sage map from §4.3 lines 240-254); `getShadowSaboteurContext(archetype, topSaboteurs)`. Test-first.

**Acceptance criteria:**
- [ ] `computeSaboteurScores` returns `Record<SaboteurId, number>` (0-10 each).
- [ ] `rankTopSaboteurs` returns 3 IDs sorted descending; ties broken alphabetically by SaboteurId (documented).
- [ ] `recommendSagePowers` returns 2 sage powers per top saboteur, deduped.
- [ ] `getShadowSaboteurContext` returns coaching template fields from Shadow table.
- [ ] Each function has at least 3 tests (happy path, tie-break, edge case).

**Verification:**
- [ ] `pnpm --filter @team-manager/core test` — RED then GREEN.

**Dependencies:** Task 10.

**Files likely touched:**
- `packages/team-manager-core/src/saboteur.ts` (new)
- `packages/team-manager-core/src/saboteur.test.ts` (new)
- `packages/team-manager-core/src/index.ts`

**Estimated scope:** M (3 files)

---

#### Task 12: PQ scoring (TDD, `logic`)
**Description:** Add `computePQScore(emotionPairs)` + `interpretPQ(score)` to `packages/team-manager-core/src/saboteur.ts` (or split into `pq.ts`). 24 emotion pairs (forced-choice Likert 1-5 on both positive and negative) → 0-100 via `positive / (positive + negative) * 100`. Item bank: `docs/references/index/mental-fitness-assessment.jsx` lines 82-108. Scoring: `docs/references/index/saboteur-implementation-plan.md` §4.2. `interpretPQ` returns one of 5 thresholds: `<50` (critical), `50-65` (mixed), `65-75` (near-tipping), `75-85` (above tipping), `≥85` (mastery).

**Acceptance criteria:**
- [ ] `computePQScore` returns 0-100 via positive/(positive+negative)*100.
- [ ] `interpretPQ` returns one of 5 threshold bands matching the references.
- [ ] Boundary tests at 0, 50, 75 (tipping), 85, 100.
- [ ] Tipping point (75 = Sage 75% / Saboteur 25%) referenced in doc-comment.

**Verification:**
- [ ] `pnpm --filter @team-manager/core test` — RED then GREEN.

**Dependencies:** Task 11.

**Files likely touched:**
- `packages/team-manager-core/src/saboteur.ts` (or `pq.ts`)
- `packages/team-manager-core/src/saboteur.test.ts` (or `pq.test.ts`)

**Estimated scope:** S (1-2 files)

---

#### Task 13: Saboteur API route (TDD, `logic`)
**Description:** New `apps/api/src/routes/saboteur.ts` with `POST /assessments/saboteur`. Body: `{userId, saboteurAnswers: number[50], pqAnswers: number[24]}`. Returns full `SaboteurAssessment`.

**Acceptance criteria:**
- [ ] Zod schema validates 50 + 24 answer arrays.
- [ ] Returns `{userId, saboteurScores, pqScore, topSaboteurs, sagePowers, completedAt}`.
- [ ] Mounted at `/assessments/saboteur` in `app.ts`.
- [ ] Unit tests cover happy path, invalid input, archetype-less subject.

**Verification:**
- [ ] `pnpm --filter @team-manager/api test` green.

**Dependencies:** Tasks 11-12.

**Files likely touched:**
- `apps/api/src/routes/saboteur.ts` (new)
- `apps/api/src/routes/saboteur.test.ts` (new)
- `apps/api/src/app.ts`

**Estimated scope:** S (2-3 files)

---

#### Task 14: Saboteur assessment UI flow
**Description:** New page `Layer3SaboteurAssessmentPage.tsx` at `/assessment/layer-3`. Lift the UI shape from `docs/references/index/mental-fitness-assessment.jsx` (lines 165-435): two sub-flows — (a) 50 Likert saboteur items (5-point colored scale), (b) 24 PQ emotion-pair items (two columns: positive | negative, Likert each). Progress bar + 15-min time-budget chip. Item text translated to EN. Submit calls `POST /assessments/saboteur`.

**Acceptance criteria:**
- [ ] Route `/assessment/layer-3` registered.
- [ ] Saboteur 50-Likert UI (5-point scale).
- [ ] PQ 24 emotion-pair UI (forced-choice Likert per `saboteur-implementation-plan.md`).
- [ ] Progress bar across both sub-flows.
- [ ] All strings in `locales/en/layer3.json`.

**Verification:**
- [ ] Manual: complete the full Layer 3 flow in browser, time it (~15 min target).

**Dependencies:** Task 13.

**Files likely touched:**
- `apps/web/src/pages/Layer3SaboteurAssessmentPage.tsx` (new)
- `apps/web/src/components/SaboteurLikertForm.tsx` (new)
- `apps/web/src/components/PQEmotionPairForm.tsx` (new)
- `apps/web/src/locales/en/layer3.json` (new)
- `apps/web/src/App.tsx`
- `apps/web/src/store/index.ts` (add `saboteur` slice)

**Estimated scope:** M (5-6 files) — UI heavy, `skip-tests`

---

#### Task 15: Personal coaching report (on-screen only)
**Description:** Layer 3 result view, matching the visual spec in `docs/references/index/assessment-output-report.pdf` pages 1-9 — but rendered on-screen only. **PDF download is parked / out of scope for v1.** Saboteur 10-axis radar; PQ gauge (semicircular 0-100, tipping-point marker at 75); top-3 saboteur cards (full content: icon, color, description, lie, original strength, sage antidotes); recommended sage powers card; age-banded PQ benchmark table (18-25: 51, 26-35: 54, 36-45: 57, 46-55: 59, 56-65: 61, 65+: 63) showing user's score against peers; action plan (3 priority items); Cynefin context callout linking back to Layer 1 archetype.

**Acceptance criteria:**
- [ ] `<SaboteurRadarChart />` renders 10-axis radar (Recharts).
- [ ] `<PQGauge />` renders semicircular gauge with score + tipping-point marker at 75.
- [ ] Top-3 saboteur cards show full content from `data/saboteurs.en.ts`.
- [ ] PQ benchmark table shows user's score with their age band highlighted.
- [ ] Action plan section renders 3 priority items derived from top saboteurs + sage antidotes.
- [ ] Cynefin callout reads Layer 1 archetype.

**Verification:**
- [ ] Manual: complete Layer 3, walk through the on-screen report.
- [ ] All 6 sections from the PDF mockup render correctly.

**Dependencies:** Task 14.

**Files likely touched:**
- `apps/web/src/pages/Layer3SaboteurPersonalPage.tsx` (new)
- `apps/web/src/components/SaboteurRadarChart.tsx`, `PQGauge.tsx`, `SaboteurCard.tsx`, `SagePowerCard.tsx`, `PQBenchmarkTable.tsx`, `ActionPlan.tsx`, `CynefinContextCallout.tsx` (new)

**Estimated scope:** L (7-8 files) — UI heavy, `skip-tests`. Consider splitting if it grows beyond 8 files.

> **Parked (post-v1 backlog):** PDF export of this report (page-for-page mirror of `assessment-output-report.pdf`'s 12 pages, plus chart-to-image bridge for Recharts). Library decision (react-pdf vs jsPDF+html2canvas) deferred until this is unparked.

---

### ✅ Checkpoint D — Layer 3 personal view ships (valid stopping point #3)
- [ ] User can complete Layer 1 → Layer 2 → Layer 3 in sequence.
- [ ] Layer 3 personal coaching report renders end-to-end.
- [ ] All cross-references (Layer 3 → Layer 1 archetype) work.
- [ ] All tests green; typecheck and build clean.
- [ ] Review with human before Phase 5.

---

### Phase 5 — Team-fit Slice

> Clash is computed via radar comparison — same pattern as `computeKiviatData` (CVF/leadership) and `aggregatePeerLeadershipAssessments`. No hand-authored rules needed.

#### Task 16: Team-fit scoring (TDD, `logic`)
**Description:** Implement `packages/team-manager-core/src/saboteur-team-fit.ts`. Pure vector math against the team's 10-axis saboteur radars. Exports:
- `aggregateTeamSaboteurScores(members)` — per-saboteur mean across the team (mirror of `aggregatePeerLeadershipAssessments`).
- `computeTeamSaboteurVariance(members)` — per-axis variance; low variance + high mean = team-wide concentration on that saboteur (a clash signal).
- `pairwiseSaboteurDistance(a, b)` — euclidean (or cosine) distance between two 10-axis vectors, normalized 0-1.
- `findHighOverlapAxes(a, b, threshold = 6)` — axes where both members score ≥ threshold; flagged as "shared blind spot" pairs.
- `classifyPairRelation(a, b)` — derive `'amplifying' | 'balancing' | 'neutral'` from distance + overlap count.
- `recommendTeamFitImpact(team, candidate)` — for a prospective new member: predicted shifts in team's per-axis mean + new high-overlap pairs they'd create.

**Acceptance criteria:**
- [ ] `aggregateTeamSaboteurScores` returns `Record<SaboteurId, number>`.
- [ ] `pairwiseSaboteurDistance` is symmetric, returns 0 for identical vectors, 1 for maximally distant.
- [ ] `classifyPairRelation` rules documented and tested: `amplifying` when distance < 0.3 AND ≥2 high-overlap axes; `balancing` when distance > 0.7; else `neutral`.
- [ ] Tests cover: empty team, single-member, identical-twins pair, opposite pair, candidate amplifies, candidate balances.

**Verification:**
- [ ] `pnpm --filter @team-manager/core test` — RED then GREEN.

**Dependencies:** Task 11 (saboteur scoring must exist).

**Files likely touched:**
- `packages/team-manager-core/src/saboteur-team-fit.ts` (new)
- `packages/team-manager-core/src/saboteur-team-fit.test.ts` (new)

**Estimated scope:** S (2 files) — pure math, no domain data

---

#### Task 17: Team-fit API route (TDD, `logic`)
**Description:** New `GET /assessments/saboteur/:userId/team-fit/:teamId` route. Returns clash matrix for the team, plus impact of `userId` on the team.

**Acceptance criteria:**
- [ ] Endpoint returns `{teamDistribution, clashPairs, candidateImpact}`.
- [ ] 404 if team or user not found.
- [ ] Authorization: manager-only (use existing permission middleware pattern).

**Verification:**
- [ ] `pnpm --filter @team-manager/api test` green.

**Dependencies:** Task 16.

**Files likely touched:**
- `apps/api/src/routes/saboteur.ts` (extend with new route)
- `apps/api/src/routes/saboteur.test.ts`

**Estimated scope:** S (2 files)

---

#### Task 18: Team-fit manager UI
**Description:** New manager-only page `Layer3TeamFitPage.tsx`. Renders: team-level saboteur distribution bar chart, clash-pair matrix, "who balances whom" suggestions. Hidden from member role. Copy in EN via `t()`.

**Acceptance criteria:**
- [ ] Route `/teams/:id/saboteur-fit` registered, manager-only.
- [ ] Clash matrix renders as a 2D grid with severity color-coding.
- [ ] Team saboteur distribution chart (top 3 prevalent saboteurs).
- [ ] "Adding X to this team will amplify Hyper-Vigilance" recommendation visible.
- [ ] All strings in `locales/en/layer3-team-fit.json`.

**Verification:**
- [ ] Manual: log in as manager, navigate to a team with mixed saboteurs, see the matrix.
- [ ] Member account: page is inaccessible.

**Dependencies:** Task 17.

**Files likely touched:**
- `apps/web/src/pages/Layer3TeamFitPage.tsx` (new)
- `apps/web/src/components/ClashMatrix.tsx` (new)
- `apps/web/src/components/TeamSaboteurDistribution.tsx` (new)
- `apps/web/src/App.tsx`
- `apps/web/src/locales/en/layer3-team-fit.json` (new)

**Estimated scope:** M (4-5 files) — `skip-tests`

---

### ✅ Checkpoint E — Team-fit ships
- [ ] Manager can view team-fit clash matrix for any team.
- [ ] Single Saboteur assessment now powers two distinct views (personal + team-fit).
- [ ] Tests green; build clean.
- [ ] Review with human before Phase 6.

---

### Phase 6 — Persistence Cut-over (Infra, isolated from features)

#### Task 20: Drizzle schema for all tables
**Description:** Define `apps/api/src/db/schema.ts` with tables: `users`, `organizations`, `teams`, `team_members`, `leadership_assessments`, `behavioral_core_assessments`, `saboteur_assessments`, `cvf_assessments`, `skill_assessments`, `peer_leadership_assessments`, `peer_cvf_assessments`, `peer_skill_assessments`. **Adapt the Prisma schema sketch from `docs/references/index/implementation-plan.md` lines 89-127** (column names: `responses`, `saboteurScores`, `pqScore`, `topSaboteurs`, `completedAt`) — translate Prisma syntax to Drizzle. Generate initial migration.

**Acceptance criteria:**
- [ ] Schema file compiles.
- [ ] `pnpm drizzle-kit generate` produces a migration file.
- [ ] Migration applies cleanly to a fresh Postgres.

**Verification:**
- [ ] Spin up Postgres locally; run migration; `\dt` shows all tables.

**Dependencies:** None (can run in parallel with Phases 1-5).

**Files likely touched:**
- `apps/api/src/db/schema.ts` (new)
- `apps/api/src/db/index.ts` (new — Drizzle client)
- `apps/api/drizzle.config.ts` (new)
- `apps/api/migrations/0001_init.sql` (generated)

**Estimated scope:** M (4 files)

---

#### Task 21: Migrate API routes off in-memory stores
**Description:** Replace in-memory arrays in `assessments.ts`, `peer-assessments.ts`, `behavioral-core.ts`, `saboteur.ts` with Drizzle queries. One route file per commit.

**Acceptance criteria:**
- [ ] All POST/GET endpoints read/write through Drizzle.
- [ ] Existing API tests continue to pass (against a test DB or mocked Drizzle).
- [ ] Add one new integration test: POST then re-GET after process restart, expect persisted data.

**Verification:**
- [ ] `pnpm --filter @team-manager/api test` green.
- [ ] Integration test passes against a real Postgres.

**Dependencies:** Task 20.

**Files likely touched:**
- `apps/api/src/routes/assessments.ts`
- `apps/api/src/routes/peer-assessments.ts`
- `apps/api/src/routes/behavioral-core.ts`
- `apps/api/src/routes/saboteur.ts`
- `apps/api/src/routes/*.test.ts`

**Estimated scope:** M (5 files)

---

#### Task 22: Unified profile endpoint
**Description:** New `GET /profile/:userId` returning `UnifiedLeadershipProfile` (user + OA + Behavioral Core + Saboteur + CVF + Skills). This is the API the web app uses to render any cross-layer view without re-fetching each piece.

**Acceptance criteria:**
- [ ] Endpoint returns full nested profile.
- [ ] Missing layers return `undefined` (not error) — partial profiles valid.
- [ ] Permission check: user can view own profile + manager can view anyone in org.

**Verification:**
- [ ] `curl localhost:3000/profile/<id>` returns expected shape.
- [ ] Unit tests cover full, partial, and permission-denied cases.

**Dependencies:** Task 21.

**Files likely touched:**
- `apps/api/src/routes/profile.ts` (new)
- `apps/api/src/routes/profile.test.ts` (new)
- `apps/api/src/app.ts`

**Estimated scope:** S (2-3 files)

---

### ✅ Checkpoint F — Full pipeline persistent
- [ ] All three layers operate against the database.
- [ ] Unified profile endpoint returns cross-layer data.
- [ ] Pre-existing localStorage-only paths still work (graceful degradation).
- [ ] All tests green; build clean; production-deployable.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Single-vs-distribution Drives→Archetype decision** unresolved per brief | Medium (forks UI in Layer 2) | Build both projections; tag every fork with `// DESIGN-Q: single-vs-distribution`. Defer decision to UI/copy A/B. |
| **15-min Layer 3 budget may be optimistic** with 50+24 items | Medium (UX contract violation) | Pilot with internal users at end of Phase 4. If consistently >18 min, negotiate item reduction with owner before Phase 5. |
| **Drizzle migration during active feature work** could conflict | Medium | Run Phase 6 strictly after Checkpoint D, OR run on a parallel branch and merge after each feature checkpoint. Recommend the latter for shorter integration window. |
| **Existing 50 tests break during Layer 1 reframe** | Low (Tasks 3-4 are copy-only) | Run full test suite at every checkpoint; Phase 2 explicitly avoids touching scoring functions. |
| **i18n promise not honored (EN-only ships, IT promised, never delivered)** | Low (architecture supports it) | Add a guard test: render the app with `lng='it'` and confirm no English strings leak through (after a stub `it.json` is added). Run this test at every checkpoint where new copy lands. |

## Open Questions

### Resolved by references
- ~~PI instrument source~~ — Forma's own 86-adjective bank in `assessment-mock.jsx`. No licensing needed.
- ~~16 vs 17 sub-profiles (Camaleonte)~~ — references include all 17 with full content. Re-included.
- ~~Layer 1 reframe scope~~ — assumed approach implemented in Phase 2; visible in browser; can confirm.
- ~~Peer assessment for Saboteur~~ — references model it as self-only. Plan confirms self-only.
- ~~DB choice~~ — staying with Drizzle (already in `package.json`); Prisma schema sketch in `implementation-plan.md` is just a reference shape.

### Still open
1. **Single-vs-distribution Drives→Archetype** (per brief): with 17 sub-profile centroids in hand, the radar IS the distribution. But the question remains whether Layer 2 UI surfaces the single nearest sub-profile as a headline (single-dominant projection) or the full 17-distance radar (full-distribution projection). Defer; tag forks with `// DESIGN-Q`.

### Parked (revisit post-v1)
- PDF export of the Layer 3 coaching report (visual spec exists in `assessment-output-report.pdf`; library and chart-bridge decisions deferred).

## Parallelization Opportunities

- **Phase 1 tasks** (T1, T2) are independent — parallel safe.
- **Phase 6 (T20)** can start any time after Phase 1, in a parallel branch. Merge at Checkpoint D or E.
- **Within Phase 3**: T5 (types) must precede T6 (scoring); T6 must precede T7 (API); T8 (UI) can start as soon as T7 has a working contract — useful for parallelizing UI vs. backend engineers.
- **Within Phase 4**: T10 (static data) is independent of T11-12 (scoring) since they share only the ID unions — parallelize once `SaboteurId` is committed in T10.
- **Phase 5** is strictly sequential (T16 blocks T17 blocks T18 blocks T19).
