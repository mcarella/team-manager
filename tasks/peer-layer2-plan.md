# Implementation Plan — Peer Behavioral Core (Layer 2 × peer feedback)

> Source: feature request — "feedback to others must include the deep part too;
> 'how others see me' should show an adjective cloud that shapes the peer-perceived
> archetype + behaviors. Plus synthetic seed data for the whole new path."

## Context

Today the **Feedback to Others** tab on `/assessment/leadership` collects only the 12-question Layer 1 peer evaluation. The **How Others See Me** tab shows aggregated Layer 1 peer data only. The Layer 2 Behavioral Core (86-adjective trait instrument) is single-player: you can take it yourself, no one else can rate you.

This plan adds the missing symmetric flow:

1. **Feedback to Others** progressive flow — start with the 12-question Layer 1 read, then optionally a single-pass 86-adjective Layer 2 read on the same teammate. Same shape as the SELF flow on `/assessment/leadership > mine`.
2. **How Others See Me** gains a peer-Behavioral-Core block:
   - **Adjective cloud** — peers pick adjectives describing you; aggregate and render as a frequency-sized word cloud, color-coded by behavioral factor
   - **Peer-perceived 4-factor drives** — computed from aggregated peer picks
   - **Peer-perceived sub-profile** — nearest centroid match on aggregated peer factors
   - **Self ↔ peer delta** — overlay self vs peer on the 4-factor kiviat to surface blind spots / hidden strengths
3. **Synthetic seed data** — extend the seed page so the new peer-Layer-2 path is fully visible without collecting real peer feedback (essential for demo / iteration).

## Architecture Decisions

- **Symmetry with Layer 1 peer pattern.** Mirror the existing `aggregatePeerLeadershipAssessments` shape exactly — same upsert-by-assessor pattern, same summary contract, same route shapes (POST + summary + my-assessment GETs).
- **Single-pass peer form (not two-pass).** The self-form has Self-Concept + Self because the subject is rating themselves on two perspectives. A peer is one perspective on someone else; one pass is sufficient and matches PI's actual peer-report methodology.
- **Reuse, don't duplicate, the adjective grid.** The 86-adjective selection UI (with shuffle + 15-pick minimum gate) already exists in `Layer2BehavioralCorePage`. Extract it as `<AdjectiveSelectionGrid />` and use it for both self-Self pass AND peer pass.
- **Adjective cloud rendered with CSS, no library.** Font-size scaled to frequency; color from the factor map (`#ef4444` D, `#f59e0b` E, `#10b981` P, `#6366f1` F). Avoids adding a dependency for one widget.
- **Anonymity preserved.** Cloud shows aggregated frequencies only — no "Alice picked Bold and Assertive". The min-evaluators rule from `computeProfileReliability` applies here too (reliability badge in the UI).
- **Synthetic data is realistic, not random.** Each fake peer rates the subject with ~60% overlap with the subject's own self-picks + targeted noise — produces meaningful self↔peer deltas instead of garbage radars.
- **TDD classification per CLAUDE.md.** Core scoring + API = `logic` (full RED→GREEN). UI = `ui` (skip-tests, visual review). Seed data = `config`.

## Dependency Graph

```
shared types (peer L2)
   │
   ▼
core: aggregatePeerBehavioralCore + adjective frequency ──▶ tests
   │
   ▼
api: POST + 2 GET routes for peer L2 ────────────────────▶ tests
   │                                  │
   ▼                                  ▼
Feedback-to-Others Layer 2 form    How-Others-See-Me cloud + summary
   │                                  │
   └───────────────┬──────────────────┘
                   ▼
         Seed page synthetic data
                   ▼
              i18n strings
                   ▼
             Manual verify
```

---

## Task List

### Phase 1 — Foundation: types + core scoring

#### Task 1: Shared peer Layer 2 types
**Description:** Add to `packages/shared/src/types.ts`:
- `PeerBehavioralCoreAssessment` — `{assessorId, subjectId, picks: string[], factors, subProfile, createdAt}` (picks = adjective IDs the peer selected describing the subject; factors + subProfile computed at submission time)
- `PeerBehavioralCoreSummary` — `{subjectId, totalEvaluators, factors, subProfile, adjectiveFrequency: Record<string, number>, subProfileCounts: Record<BehavioralCoreSubProfile, number>}`
- `AdjectiveFrequency` — small helper interface `{adjectiveId, count, factor, weight}` for cloud render

**Acceptance criteria:**
- [ ] All 3 types exported from `@team-manager/shared`
- [ ] Shapes mirror `PeerLeadershipAssessment` / `PeerLeadershipSummary` conventions

**Verification:**
- [ ] `pnpm --filter @team-manager/shared build` succeeds
- [ ] Repo-wide `pnpm typecheck` clean

**Dependencies:** None.
**Files:** `packages/shared/src/types.ts`
**Estimated scope:** XS (1 file)

---

#### Task 2: Core aggregation engine (TDD, `logic`)
**Description:** New `packages/team-manager-core/src/peer-behavioral-core.ts` exporting:
- `aggregatePeerBehavioralCoreAssessments(subjectId, assessments): PeerBehavioralCoreSummary` — upsert-by-assessor, weighted-average factors, frequency map, sub-profile counts, dominant sub-profile
- `computeAdjectiveCloud(summary, topN = 30): AdjectiveFrequency[]` — returns top-N adjectives by frequency, enriched with factor + weight (joined against `ADJECTIVES` data)

Aggregation math: for each adjective ID, count peers who picked it. Sum each adjective's weight × (count/totalEvaluators) per factor → factor scores → matchSubProfile.

**Acceptance criteria:**
- [ ] `aggregatePeerBehavioralCoreAssessments` returns correct shape with empty input (totalEvaluators=0, neutral factors near 50)
- [ ] With 3 fake peer assessments all picking the same high-D adjectives, dominance factor ≈ 90+
- [ ] `computeAdjectiveCloud` returns top-N sorted desc by count
- [ ] Sub-profile match respects camaleonte-exclusion rule (reuses existing `matchSubProfile`)
- [ ] At least 5 unit tests covering: empty, single-peer, multi-peer overlap, multi-peer divergence, cloud truncation

**Verification:**
- [ ] `pnpm --filter @team-manager/core test:run -- peer-behavioral-core` — RED → GREEN
- [ ] Existing 89 core tests still green

**Dependencies:** Task 1.
**Files:**
- `packages/team-manager-core/src/peer-behavioral-core.ts` (new)
- `packages/team-manager-core/src/peer-behavioral-core.test.ts` (new)
- `packages/team-manager-core/src/index.ts` (export)

**Estimated scope:** M (3 files, ~150 LOC)

---

### ✅ Checkpoint A — Foundation
- [ ] Types build; core tests green; no regressions in existing 89 tests.
- [ ] Aggregation function callable from anywhere in the monorepo.

---

### Phase 2 — API layer

#### Task 3: Peer Behavioral Core route + tests (TDD, `logic`)
**Description:** Mirror the existing peer-assessments router pattern. New file `apps/api/src/routes/peer-behavioral-core.ts` exposing:
- `POST /peer-assessments/behavioral-core` — body `{assessorId, subjectId, picks: string[]}`. Computes factors + sub-profile server-side, upserts in-memory store, returns the full PeerBehavioralCoreAssessment.
- `GET /peer-assessments/behavioral-core/:subjectId/summary` — returns aggregated `PeerBehavioralCoreSummary`
- `GET /peer-assessments/behavioral-core/:subjectId/my-assessment/:assessorId` — returns the assessor's own peer eval for this subject (used to pre-populate the form on re-edit)

Zod schemas, in-memory store with `// will be replaced by DB` marker, mounted in `apps/api/src/app.ts`.

**Acceptance criteria:**
- [ ] POST returns 200 with the saved assessment; second POST from same assessor for same subject UPSERTS (count stays the same in summary)
- [ ] POST rejects self-evaluation (assessorId === subjectId → 400)
- [ ] Summary GET returns `totalEvaluators: 0` for unknown subjectId
- [ ] my-assessment GET returns `null` when no eval exists
- [ ] At least 8 supertest tests covering happy paths + self-eval rejection + upsert behavior + summary aggregation

**Verification:**
- [ ] `pnpm --filter @team-manager/api test:run` — RED → GREEN
- [ ] `curl -X POST localhost:3000/peer-assessments/behavioral-core -d '{...}'` returns expected payload

**Dependencies:** Task 2.
**Files:**
- `apps/api/src/routes/peer-behavioral-core.ts` (new)
- `apps/api/src/app.ts` (mount)
- `apps/api/src/peer-behavioral-core.test.ts` (new test file at src root, matching `peer-assessments.test.ts` pattern)

**Estimated scope:** M (3 files, ~180 LOC)

---

### ✅ Checkpoint B — API working
- [ ] Server accepts POST and returns valid response; summary aggregates correctly.
- [ ] All 89 core + N new API tests green.

---

### Phase 3 — Feedback to Others: Layer 2 form

#### Task 4: Extract `<AdjectiveSelectionGrid />` shared component
**Description:** Pull the 86-adjective grid UI (with shuffle + 15-pick minimum + progress bar) out of `Layer2BehavioralCorePage.tsx` into a standalone component. Same shape, but takes a `pickedIds: Set<string>` + `onToggle` + `minPicks` + `instructionText` as props so it's pure presentational.

**Acceptance criteria:**
- [ ] `AdjectiveSelectionGrid` component renders 86 toggle buttons in a responsive grid
- [ ] Selection count + min-pick warning visible
- [ ] Refactor existing `Layer2BehavioralCorePage` to use the new component for BOTH passes (Self-Concept + Self); no visual regression
- [ ] `pnpm --filter @team-manager/web build` clean

**Verification:**
- [ ] Manual: take Layer 2 self-form in browser; flow unchanged.
- [ ] Manual: visually identical to before refactor.

**Dependencies:** None (foundation work).
**Files:**
- `apps/web/src/components/AdjectiveSelectionGrid.tsx` (new)
- `apps/web/src/pages/Layer2BehavioralCorePage.tsx` (refactor)

**Estimated scope:** S (2 files, ~140 LOC moved)

---

#### Task 5: Peer Layer 2 form in "Feedback to Others" tab
**Description:** After a user submits the Layer 1 peer eval for a teammate (existing flow), show a "Give the deeper read too (5 min)" CTA. Clicking reveals the `<AdjectiveSelectionGrid />` in third-person framing ("Pick adjectives that describe {{name}} at work"). Submit posts to `/peer-assessments/behavioral-core`. Re-entering for an already-evaluated teammate pre-populates picks from `my-assessment` endpoint.

**Acceptance criteria:**
- [ ] After Layer 1 submit, "Continue: deeper read (5 min) →" CTA appears
- [ ] CTA reveals adjective grid with third-person instructions
- [ ] Min 15 picks enforced (button disabled below threshold)
- [ ] Submit posts to API; success state visible; teammate marked as "Layer 2 evaluated"
- [ ] Re-selecting the same teammate pre-loads existing picks for editing
- [ ] All strings via `t()` in `locales/en/layer1.json` (extends existing namespace)

**Verification:**
- [ ] Manual: evaluate a teammate's Layer 1; CTA appears; pick 20 adjectives; submit; teammate marked done.
- [ ] Manual: re-select same teammate; picks pre-loaded.

**Dependencies:** Tasks 3, 4.
**Files:**
- `apps/web/src/pages/LeadershipAssessmentPage.tsx` (extend "rate" tab)
- `apps/web/src/locales/en/layer1.json` (new strings under `result.peerLayer2.*`)

**Estimated scope:** M (2 files, ~200 LOC added)

---

### ✅ Checkpoint C — Peer Layer 2 capture working
- [ ] User can submit Layer 1 + Layer 2 peer evaluations for any teammate.
- [ ] Server persists; re-edit works.
- [ ] No regression to existing Layer 1 peer flow.

---

### Phase 4 — How Others See Me: adjective heatmap

#### Task 6: `<AdjectiveTreemap />` component
**Description:** New component rendering a space-filling treemap of adjectives. Each adjective is a rectangle, size proportional to its peer-pick frequency, color by factor. Uses Recharts `<Treemap>` (already a dependency — no new package). Custom content callback renders the adjective label centered + readable. Hover tooltip shows exact count.

Color per factor (confirmed): red `#ef4444` (Dominance), amber `#f59e0b` (Extraversion), emerald `#10b981` (Patience), indigo `#6366f1` (Formality), slate `#94a3b8` (Objectivity — rarely seen but present in instrument).

**Acceptance criteria:**
- [ ] Renders top-30 adjectives by frequency in a tiled rectangular layout (no overlap, no gaps)
- [ ] Rectangle area scales with `count`
- [ ] Fill color matches the adjective's factor
- [ ] Labels render readably; tiny cells (frequency 1-2) show just a dot or empty rather than overflow
- [ ] Hover tooltip: `{adjective} — picked by N of M peers`
- [ ] Responsive width via `<ResponsiveContainer />`
- [ ] Empty state: text placeholder "No peer evaluations yet"

**Verification:**
- [ ] Manual: render with mock data of 25 adjectives at various counts; verify visual scaling + colors.
- [ ] Manual: shrink window to 400px wide; layout reflows without horizontal scroll.

**Dependencies:** Task 1.
**Files:**
- `apps/web/src/components/AdjectiveTreemap.tsx` (new)

**Estimated scope:** S (1 file, ~110 LOC)

---

#### Task 7: Integrate treemap into "How Others See Me"
**Description:** In the `mainTab === 'others'` block of `LeadershipAssessmentPage`, add a new section above the existing Layer 1 peer summary: "How peers describe you — adjective heatmap". Fetch summary from `/peer-assessments/behavioral-core/:userId/summary`. Pass `computeAdjectiveCloud(summary)` output (now → treemap data) into `<AdjectiveTreemap />`.

Plus a small color-legend underneath the treemap (4 dots + labels for D/E/P/F) so the factor colors are decoded.

**Acceptance criteria:**
- [ ] Section heading: "How peers describe you" (small caps eyebrow)
- [ ] Reliability badge from existing `computeProfileReliability` — only show treemap if `coverage >= 0.6` AND `totalEvaluators >= 2` (otherwise placeholder explaining the threshold)
- [ ] Color legend: 4 small swatches with factor names below the treemap
- [ ] Loading + empty + populated + below-threshold states all visually distinct

**Verification:**
- [ ] Manual: with mock peer data, treemap shows correctly.
- [ ] Manual: with `totalEvaluators=1`, placeholder shows instead.

**Dependencies:** Tasks 3, 6.
**Files:**
- `apps/web/src/pages/LeadershipAssessmentPage.tsx` (extend "others" tab)
- `apps/web/src/locales/en/layer1.json` (new strings)

**Estimated scope:** S (2 files, ~100 LOC)

---

### ✅ Checkpoint D — Heatmap visible
- [ ] User can take Layer 2 peer for teammates and see THEIR adjective heatmap in their "How Others See Me" view.
- [ ] Reliability gating works correctly (treemap hidden below threshold, helpful placeholder shown).

---

### Phase 5 — How Others See Me: peer Behavioral Core summary

#### Task 8: Peer-perceived drives + sub-profile section
**Description:** Below the cloud, add a "Peer-Perceived Behavioral Core" block. Shows:
- 4-factor `<KiviatChart />` of peer-aggregated factors (color: archetype theme)
- Matched sub-profile name + group label + 2-line description
- Total evaluators count

**Acceptance criteria:**
- [ ] Renders only when `totalEvaluators >= 2`
- [ ] Sub-profile card uses the `<Layer2ArchetypeCard size="compact" />` component (reuse from library) with `themeOverride` matching the user's Layer 1 archetype color
- [ ] Kiviat rendered with same factor labels as the self-drives kiviat for visual consistency

**Verification:**
- [ ] Manual: peers' aggregated drives display correctly; matched sub-profile makes sense given peer picks.

**Dependencies:** Tasks 7, plus existing `Layer2ArchetypeCard` from prior phase.
**Files:**
- `apps/web/src/pages/LeadershipAssessmentPage.tsx` (extend "others" tab)

**Estimated scope:** S (1 file, ~80 LOC)

---

#### Task 9: Self vs peer delta overlay
**Description:** When BOTH self Layer 2 (`member.behavioralCore`) AND peer Layer 2 summary exist, render a small overlaid kiviat showing self drives (solid) vs peer drives (dashed). Plus a one-line delta verdict:
- Aligned (avg per-factor delta < 10)
- Partially aligned (10–20)
- Blind spot (> 20 on at least one factor)

**Acceptance criteria:**
- [ ] Overlaid 4-axis kiviat with both polygons + legend
- [ ] Verdict banner color-coded (emerald / amber / red)
- [ ] Only renders when both self + peer L2 exist

**Verification:**
- [ ] Manual: with mock data where self and peers diverge, verdict reads "Blind spot" with the diverging factor named.

**Dependencies:** Task 8.
**Files:**
- `apps/web/src/pages/LeadershipAssessmentPage.tsx` (extend "others" tab)
- `apps/web/src/components/KiviatChart.tsx` (extend to accept `compareAxes` for overlay)

**Estimated scope:** M (2 files, ~120 LOC)

---

### ✅ Checkpoint E — Full peer L2 surface visible
- [ ] Cloud + drives + sub-profile + delta all visible on "How Others See Me".
- [ ] Works correctly across all states (no peer data / partial / full).

---

### Phase 6 — Synthetic seed data

#### Task 10: Synthetic peer Layer 2 generator
**Description:** Pure function `generateSyntheticPeerBehavioralCore(subject, peers, divergenceLevel)`. For each peer, generates a Set of picked adjective IDs that:
- Has ~60% overlap with the subject's own self-picks (when subject.behavioralCore exists)
- Has 30% targeted noise toward the subject's sub-profile centroid (so peers "see" a coherent picture)
- Has 10% random noise to feel natural

If subject has NO self-Layer-2 yet, generate around a randomly-assigned sub-profile centroid + noise. This makes the peer data internally coherent even without subject self-data.

`divergenceLevel: 'aligned' | 'mixed' | 'blind-spot'` controls the noise: aligned → mostly same picks; blind-spot → peers heavily pick adjectives in factors the subject didn't engage with.

**Acceptance criteria:**
- [ ] Function exported from `apps/web/src/data/synthetic-peer-data.ts`
- [ ] Returns `PeerBehavioralCoreAssessment[]` ready to POST to the API
- [ ] Snapshot: aligned mode produces self↔peer dist < 15 on aggregated factors
- [ ] Snapshot: blind-spot mode produces dist > 25 on at least one factor
- [ ] No randomness in tests — accepts a `seed: number` for deterministic output

**Verification:**
- [ ] Manual: generate for a 5-person team, inspect aggregated cloud — looks coherent, not random noise.

**Dependencies:** Task 2 (uses aggregation to validate output).
**Files:**
- `apps/web/src/data/synthetic-peer-data.ts` (new)
- `apps/web/src/data/synthetic-peer-data.test.ts` (new) — vitest

**Estimated scope:** M (2 files, ~180 LOC)

---

#### Task 11: Wire seed generator into `/seed` page
**Description:** Extend `SeedPage.tsx` to offer a "Seed peer Layer 2 evaluations" button. When clicked, for each existing team member, generates synthetic peer evaluations from their teammates (3-5 peers per subject, mix of `aligned`/`mixed`/`blind-spot` distributions) and POSTs them to `/peer-assessments/behavioral-core`. Shows progress + final summary ("Seeded 47 peer Behavioral Core evaluations across 8 members").

**Acceptance criteria:**
- [ ] Button visible on `/seed` page
- [ ] Generates 3-5 peers per member, randomized divergence per peer
- [ ] All POSTs complete with success; failed ones reported in a small error list
- [ ] After seed, navigating to any member's `/assessment/leadership > others` tab shows realistic cloud + drives

**Verification:**
- [ ] Manual: hit `/seed`, click button, navigate to any team member's "How Others See Me", verify cloud is non-empty and feels real.

**Dependencies:** Task 10.
**Files:**
- `apps/web/src/pages/SeedPage.tsx` (extend)

**Estimated scope:** S (1 file, ~120 LOC)

---

### ✅ Checkpoint F — Synthetic data works
- [ ] After hitting seed, the full Layer 2 peer experience is visible for every member without any manual peer assessment.
- [ ] Aligned / blind-spot variation visible across members.

---

### Phase 7 — Polish & verification

#### Task 12: i18n strings audit
**Description:** Sweep `locales/en/layer1.json` (and `layer2.json` if needed) for all new copy added in phases 3-5. Group new keys under `peerLayer2.*` namespace for clarity. Verify no hardcoded strings in the new components.

**Acceptance criteria:**
- [ ] All new copy authored in `en/*.json` files
- [ ] No hardcoded user-facing strings in new TSX
- [ ] Stub `it/layer1.json` test: drop a 1-key Italian file, confirm i18n switcher appears (already verified in T1 of prior plan)

**Verification:**
- [ ] `grep -rn "Pick adjectives\|peer Behavioral\|Adjective Cloud" apps/web/src --include="*.tsx" | wc -l` returns near-zero hardcoded matches.

**Dependencies:** Phases 3-5 done.
**Files:**
- `apps/web/src/locales/en/layer1.json`

**Estimated scope:** XS (1 file, content audit)

---

#### Task 13: End-to-end manual verification
**Description:** Full-flow manual test:
1. Log in as member A
2. Take Layer 1 + Layer 2 self assessments
3. Switch to "Feedback to Others", evaluate member B with Layer 1 + Layer 2
4. Log in as member B
5. View "How Others See Me" — should see Layer 1 peer summary + adjective cloud + peer drives + delta
6. Hit `/seed`, generate more synthetic data
7. Verify member B's view now richer

**Acceptance criteria:**
- [ ] All 7 steps pass without errors
- [ ] All gates from previous phases still green
- [ ] No console errors / TS warnings

**Dependencies:** Phases 1-6.

**Estimated scope:** Manual.

---

### ✅ Checkpoint G — Feature shipped
- [ ] Both flows (real + synthetic) produce coherent, helpful "How Others See Me" views.
- [ ] All tests green; build clean.
- [ ] Ready for commit + merge.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **86-adjective × N peers is heavy.** A 5-person team rating each other on both layers = ~25 min per rater. May see drop-off. | Medium-High | Layer 2 peer is OPT-IN via the post-L1 CTA. Make the "skip" path frictionless. Add reliability gates so missing peer L2 doesn't break the UI. |
| **Treemap tiny cells (count 1-2) become unreadable.** Adjectives picked by only 1 peer end up as a few-px square. | Low | Truncate to top 30 by frequency (already planned); skip rendering for cells below a min area; cap min label visibility — show empty cell with hover tooltip only. |
| **Synthetic data feels fake.** Random noise produces incoherent clouds. | Medium | Generator anchors on the subject's actual sub-profile centroid (when available), produces realistic distributions. Test snapshot the output. |
| **Anonymity violation risk.** Cloud frequency from 2 peers could trivially identify who picked what if you cross-check with Layer 1 peer data. | Medium | Show cloud only when `totalEvaluators >= 2`; reliability badge ("Sample too small to interpret" for n<2 or coverage<50%). |
| **Self ↔ peer delta misinterpreted.** "Blind spot" framing may feel attacky. | Low | Copy the existing Layer 1 mismatch banner tone ("you see yourself as X, peers see you as Y" — neutral, not accusatory). |
| **API in-memory store loses peer data on restart.** Same as the other peer routes (already a known limitation). | Low | Plan migration to Drizzle in the broader 3-layer plan's Phase 6 — peer-L2 will be migrated together with the rest. |

## Open Questions — resolved

1. ~~Cloud color-coding~~ → **By factor** (D/E/P/F with red/amber/emerald/indigo; Objectivity slate)
2. ~~Show subject's picks to peer while rating~~ → **Blind rating** (no peek; peer evaluates without bias)
3. ~~Reliability threshold for peer Layer 2~~ → **Same as peer Layer 1** (`coverage >= 0.6` AND `totalEvaluators >= 2`)
4. ~~UX when subject hasn't done self-Layer-2~~ → **Show peer data + small "Take Layer 2 to enable comparison" hint** in the delta section
5. ~~Cloud vs heatmap~~ → **Heatmap (Recharts `<Treemap>`)** — proper space-filling rectangles sized by frequency, color by factor. No new dependency, more structured than a word cloud.

## Critical files

**Create:**
- `packages/team-manager-core/src/peer-behavioral-core.ts` + `.test.ts`
- `apps/api/src/routes/peer-behavioral-core.ts`
- `apps/api/src/peer-behavioral-core.test.ts`
- `apps/web/src/components/AdjectiveSelectionGrid.tsx`
- `apps/web/src/components/AdjectiveTreemap.tsx`
- `apps/web/src/data/synthetic-peer-data.ts` + `.test.ts`

**Modify:**
- `packages/shared/src/types.ts`
- `packages/team-manager-core/src/index.ts`
- `apps/api/src/app.ts`
- `apps/web/src/pages/Layer2BehavioralCorePage.tsx` (refactor to use shared adjective grid)
- `apps/web/src/pages/LeadershipAssessmentPage.tsx` (both `rate` and `others` tabs)
- `apps/web/src/pages/SeedPage.tsx`
- `apps/web/src/components/KiviatChart.tsx` (overlay support)
- `apps/web/src/locales/en/layer1.json`

## Estimated total scope

| Phase | Tasks | Effort |
|---|---|---|
| 1 — Foundation | T1, T2 | ~150 LOC core + tests |
| 2 — API | T3 | ~180 LOC + tests |
| 3 — Feedback to Others | T4, T5 | ~340 LOC |
| 4 — Adjective heatmap | T6, T7 | ~210 LOC |
| 5 — Peer summary + delta | T8, T9 | ~200 LOC |
| 6 — Synthetic seed | T10, T11 | ~300 LOC + tests |
| 7 — Polish | T12, T13 | content + manual |
| **Total** | **13 tasks** | **~1,340 LOC** including tests |

13 tasks across 7 phases, 7 checkpoints. Largest single phase is Phase 6 (synthetic data) which is mostly mechanical generation. The critical path is Phases 1→2→3 (foundation + API + capture); once those land, the visible "How Others See Me" sections (Phases 4-5) light up incrementally as peers contribute data, with the seed page (Phase 6) making everything demo-able instantly.
