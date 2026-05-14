# Implementation Plan — "Growth" tab + Saboteur Assessment (Layer 3 MVP)

## Overview

Add a top-nav **Growth** tab (for both members and managers) that lands on a new `/growth` hub page. From the hub, the user can launch the **Saboteur Assessment** (Layer 3 of the Forma pipeline): 50 Likert items + 24 PQ emotion pairs → top-3 saboteurs + PQ score + recommended Sage Powers.

This MVP delivers the **personal coaching view** only. Layer 3's team-fit view, peer assessment, and Saboteur library are explicitly **out of scope** for this plan.

The Saboteur design is already heavily documented at `docs/ideas/saboteur-implementation-plan.md` (1111 lines) — the question bank, scoring formulas, archetype copy, and UI shape are pre-authored. This plan is about **integrating that spec into the existing monorepo** without re-deriving content.

---

## Architecture Decisions

1. **Reuse the existing assessment pattern** — types in `packages/shared`, scoring in `@team-manager/core`, route in `apps/api/src/routes/`, page in `apps/web/src/pages/`. Mirror `Layer2BehavioralCorePage` structure: assessment form → submit → result view → recap stays accessible via Growth hub.
2. **Question bank lives in `@team-manager/core/data/saboteur-questions.ts`** — single source of truth, EN copy first (multilingual-ready namespace structure for later IT translation).
3. **i18n namespace = `layer3`** — matches existing `layer1`/`layer2` convention.
4. **In-memory API store** — same pattern as current routes. No DB work in this plan (that's a separate `chore/drizzle-schema` initiative).
5. **Zustand slice for `saboteur`** — `currentSaboteurAssessment`, `saveSaboteurAssessment`, persisted to localStorage.
6. **Time budget contract** — 10-min target with `TimeBudgetChip` (consistent with L1/L2).
7. **No peer flow in this plan** — Layer 3 is self-only for now. Peer (360° saboteur perception) is a follow-up.

---

## Open Questions for Product Owner

These must be answered before Phase 2 starts (Phase 1 is safe to ship regardless):

1. **PQ co-shipping** — does the PQ score assessment ship together with the Saboteur questionnaire (one continuous flow, as the spec suggests), or split into Phase A (saboteur) and Phase B (PQ)? Recommendation: **ship together** — the spec treats them as one diagnostic, and the result view needs both.
2. **Roles with Growth tab** — visible to members AND managers? (Company role probably not — companies don't take personal assessments.) Recommendation: **member + manager**, not company.
3. **Result-view scope** — top-3 saboteur cards + PQ gauge + recommended Sage Powers is the spec minimum. Should we ALSO render the full 10-saboteur radar from day one, or defer? Recommendation: **include the radar** — it's the visual hook and Recharts work is cheap.
4. **Saboteur library page** — `/library/saboteurs` exists in the longer-term plan; do we land it in this MVP or defer? Recommendation: **defer** — flag for follow-up under the Feature Resonance rule (the result-view cards should be designed reusable so the library can pick them up later).
5. **Synthetic seed data** — should `seed.ts` generate synthetic saboteur self-assessments for the 20 seeded members so the Growth tab feels populated immediately? Recommendation: **yes** — required by the Feature Resonance rule (any new persisted entity must be in the seed).

---

## Dependency Graph

```
Domain types (SaboteurId, PQScore, SaboteurAssessment, SagePowerId)
    │
    ├── Core scoring (computeSaboteurScores, computePQScore, rankTopSaboteurs, recommendSagePowers)
    │       │
    │       └── API route (POST/GET /assessments/saboteur)
    │               │
    │               └── Web pages (Growth hub + Saboteur assessment + result view)
    │                       │
    │                       └── TopBar "Growth" entry + route registration
    │
    └── Question bank + saboteur/sage reference data (static)
            │
            └── Used by both core scoring AND web pages

Synthetic seed → depends on API route
i18n namespace → developed alongside web pages
```

Implementation order follows the graph bottom-up but **delivers visible value at every phase** (vertical slices).

---

## Task List

### Phase 1 — Growth tab + empty hub page

Establishes the entry point. Routing + nav verified before any domain work.

- **Task 1 (UI, S)** — Add "Growth" item to `MEMBER_NAV` and `MANAGER_NAV` in `TopBar.tsx`. Pointing at `/growth`. No new route yet — clicking falls through to default route.
- **Task 2 (UI, S)** — Create `GrowthHubPage.tsx` with a "Saboteur Assessment — Coming Soon" placeholder card. Register route `/growth` in `App.tsx`.
- **Task 3 (UI, XS)** — Add `t('layer3:hub.*')` namespace skeleton (`apps/web/src/locales/en/layer3.json`) with the placeholder copy. Wire `i18next` namespaces array.

**Checkpoint 1**: Run `pnpm dev`. Log in as member → see Growth tab → click → see placeholder. Same for manager. Quality gates pass (`pnpm typecheck && pnpm lint && pnpm build`).

---

### Phase 2 — Saboteur domain types + scoring engine (logic, full TDD)

The foundation everything else builds on. No UI work.

- **Task 4 (logic, S)** — Add types to `packages/shared/src/types.ts`: `SaboteurId` (10-string union — Judge, Avoider, Controller, Hyper-Achiever, Hyper-Rational, Hyper-Vigilant, Pleaser, Restless, Stickler, Victim), `SagePowerId` (5-string union), `SaboteurScores` (Record<SaboteurId, number>), `PQScore`, `SaboteurAssessment`. Verify against `docs/ideas/saboteur-implementation-plan.md` §2.1.
- **Task 5 (logic, M, TDD)** — Create `packages/team-manager-core/src/saboteur.ts`:
  - `computeSaboteurScores(answers: number[]): SaboteurScores` — group 50 Likert answers by saboteur (5 items each), mean × 2 → 0-10.
  - `computePQScore(pairs: number[]): number` — 24 pairs → 0-100 (sage_share × 100).
  - `rankTopSaboteurs(scores): SaboteurId[]` — top 3 with documented tie-break (declared order from spec).
  - `recommendSagePowers(topSaboteurs): SagePowerId[]` — opinionated static map from spec §4.
  - **Tests**: snapshot test per saboteur computation, PQ edge cases (all-sage, all-saboteur, mid), tie-break test.
- **Task 6 (logic, M)** — Create `packages/team-manager-core/src/data/saboteurs.ts` (10-saboteur reference: id, label, motto, origin, hijackedStrength, sageAntidote) and `sage-powers.ts` (5 sage powers). Both EN-keyed. **Source the content verbatim from `docs/ideas/saboteur-implementation-plan.md`.**
- **Task 7 (logic, M)** — Create `packages/team-manager-core/src/data/saboteur-questions.ts` exporting `SABOTEUR_QUESTIONS` (50 Likert items, each tagged with `saboteurId`) and `PQ_EMOTION_PAIRS` (24 pairs). Source from spec §3.

**Checkpoint 2**: `pnpm --filter @team-manager/core test:run` green for saboteur tests. RED→GREEN visible. No TypeScript errors. Domain logic locked.

---

### Phase 3 — API route

Persist saboteur assessments and expose them to the web app.

- **Task 8 (logic, S, TDD)** — Create `apps/api/src/routes/saboteur.ts`:
  - `POST /assessments/saboteur` — Zod-validated body `{ userId, answers: number[50], pqPairs: number[24] }`. Computes scores + PQ + top-3 + sage powers, stores in `saboteurStore`, returns the full assessment.
  - `GET /assessments/saboteur/:userId` — returns stored assessment or `null`.
  - Mirror error-handling shape from `assessments.ts`.
- **Task 9 (logic, S, TDD)** — Add saboteur supertest tests to `apps/api/src/assessments.test.ts` (or new file): happy path, 400 on bad input, GET-not-found returns null.
- **Task 10 (logic, S)** — Mount router in `apps/api/src/app.ts`.

**Checkpoint 3**: `pnpm --filter @team-manager/api test:run` green (requires `pnpm --filter @team-manager/shared build && pnpm --filter @team-manager/core build` first). Curl POST + GET works end-to-end.

---

### Phase 4 — Saboteur assessment UI flow

User can take the assessment from the Growth hub.

- **Task 11 (UI, M)** — Create `apps/web/src/pages/Layer3SaboteurAssessmentPage.tsx`. Multi-step flow:
  1. Intro card (10-min target, what this measures, "begin").
  2. 50 Saboteur Likert items (one screen of ~10 at a time, progress bar, time chip).
  3. 24 PQ emotion pairs (one screen of ~8, same chrome).
  4. Submit → POST → navigate to result view.
  Reuse `TimeBudgetChip`. Likert renderer can be a small new shared component (`LikertScale`) or inline.
- **Task 12 (UI, S)** — Register route `/assessment/layer-3` in `App.tsx`. Wire "Start Saboteur Assessment" CTA on the Growth hub (replaces the Phase-1 placeholder).
- **Task 13 (UI, S)** — Add `layer3.json` strings: assessment intro, instructions, button labels, Likert scale anchors. Source copy from spec § 6.

**Checkpoint 4**: Take the assessment in the browser as a member. Time it (~10 min). Verify all 50 + 24 items render, progress works, submit succeeds, redirect to result page (placeholder for now).

---

### Phase 5 — Result view + Growth hub status card

The payoff — user sees their saboteur profile + PQ score.

- **Task 14 (UI, M)** — Create `apps/web/src/pages/Layer3SaboteurResultPage.tsx`:
  - Header: PQ gauge (semi-circular, 0-100) + top-3 archetype pills.
  - 10-saboteur radar (Recharts, reuse `KiviatChart` patterns) — full distribution.
  - 3 expanded saboteur cards (origin, hijacked strength, sage antidote) — extract as `SaboteurCard.tsx` (reusable for the later library).
  - Recommended Sage Powers section.
  - Retake CTA.
- **Task 15 (UI, S)** — Create `SaboteurCard.tsx` and `PQGauge.tsx` as standalone components (testable in isolation, library-ready).
- **Task 16 (UI, S)** — Replace Growth hub placeholder with a status card: if user has a stored assessment, show top saboteur + PQ score + "see full result" link; if not, show "Start (10 min)" CTA.

**Checkpoint 5**: End-to-end flow works for a fresh user: Growth tab → Start → 10 min → submit → see full result → revisit Growth tab and see status card. Mobile layout reasonable.

---

### Phase 6 — Synthetic seed data + Feature Resonance closure

Per `.claude/CLAUDE.md` Feature Resonance rule: any new persisted entity must be in `seed.ts`, locales must be complete, and symmetric paths must be checked.

- **Task 17 (logic, M)** — Add `seedSaboteurAssessments` to `apps/web/src/seed.ts`. Generate deterministic synthetic assessments for all 20 members + 2 managers (Mulberry32 PRNG, biased per role for plausibility). POST to API.
- **Task 18 (UI, S)** — Update `SeedPage.tsx` counters grid to include "Saboteur" assessment count alongside Skills/Leadership/CVF/Behavioral L2.
- **Task 19 (UI, XS)** — Audit: is the Saboteur surfaced anywhere ELSE in the app that would now need to reflect it? E.g., `MemberProfileModal`, `MemberDetailPage`, `MemberList` summary chips. **Decision**: list expected resonance points and flag any that need follow-up tasks. (Likely answer for MVP: defer member-profile integration to a later phase, but document the resonance gap.)
- **Task 20 (UI, XS)** — Ensure all user-facing strings in `Layer3SaboteurResultPage` + `Layer3SaboteurAssessmentPage` + `GrowthHubPage` are in `locales/en/layer3.json`. No hardcoded strings.

**Checkpoint 6 (final)**: Re-seed, log in as any sample member, navigate Growth → see populated status card → click through → see full result. Run `pnpm typecheck && pnpm lint && pnpm build`. Manual test as manager too.

---

## Out of Scope (deferred)

Documented here so we don't accidentally implement, and so follow-up tickets are easy to file:

- **Layer 3 team-fit view** (manager-only) — clash matrix, team saboteur distribution, candidate-team compatibility. Needs separate owner input on clash rules.
- **Peer saboteur assessment** (360° perception) — symmetric to L1/L2 peer flows. Defer; document the Feature Resonance gap.
- **Saboteur library page** (`/library/saboteurs`) — defer; ensure `SaboteurCard` is library-ready.
- **Drizzle/DB persistence** — separate `chore/drizzle-schema` initiative.
- **IT translations** — `locales/it/layer3.json` deferred; structure ready.
- **Coaching report PDF export** — per spec §7, big optional feature.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Question bank content quality (50 items might need rewriting to match Forma tone) | M | Use spec content verbatim in v1; flag for copy review post-MVP |
| Likert form for 50+24 = 74 items can feel exhausting | H | Pagination (10-12 items per screen), progress bar, time chip, save-mid-flow optional later |
| Sage-power mapping is judgment-based, not algorithmic | L | Hard-code from spec § 4; revisit only on user complaint |
| Inconsistent visual treatment vs L1/L2 result pages | M | Reuse `KiviatChart`, `TimeBudgetChip`, `OAArchetypeCard`-style card patterns; keep extracted components library-ready |
| PQ scoring (24 pairs, forced-choice) confused with regular Likert | M | Distinct component for `EmotionPair` — name pair clearly with two labels per row, not 5-point scale |

---

## Verification (end-to-end)

After Checkpoint 6, the following must hold:

- [ ] `pnpm test:run` — all packages, all tests green
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm build` clean
- [ ] Manual: fresh seed, login as `marco.romano` (or any sample member) → Growth tab visible → click → status card shows top saboteur → click "see full result" → radar + PQ + cards render → "retake" works
- [ ] Manual: login as `carlo.verdi` (manager) → Growth tab visible too → assessment workable
- [ ] Manual: login as `acme` (company) → Growth tab NOT visible
- [ ] No hardcoded user-facing strings (grep for likely English copy in components)
- [ ] Feature Resonance audit (Task 19): all places saboteur SHOULD appear are either implemented or have a follow-up ticket logged
