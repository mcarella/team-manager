# TODO — "Growth" tab + Saboteur Assessment (Layer 3 MVP)

> Plan: `tasks/growth-saboteur-plan.md`. Tick boxes as you go. Resolve **Open Questions** in the plan before starting Phase 2.

## Phase 1 — Growth tab + empty hub
- [ ] **Task 1** — Add "Growth" to MEMBER_NAV + MANAGER_NAV in `TopBar.tsx` (route: `/growth`)
- [ ] **Task 2** — Create `apps/web/src/pages/GrowthHubPage.tsx` (placeholder "Saboteur — Coming Soon" card) + register route in `App.tsx`
- [ ] **Task 3** — Create `apps/web/src/locales/en/layer3.json` with `hub.*` keys; wire namespace into `i18next` config
- [ ] **Checkpoint 1** — `pnpm dev` + visual nav check (member + manager); `pnpm typecheck && pnpm lint && pnpm build` green

## Phase 2 — Saboteur domain + scoring (logic, full TDD)
- [ ] **Task 4** — Types in `packages/shared/src/types.ts`: `SaboteurId`, `SagePowerId`, `SaboteurScores`, `PQScore`, `SaboteurAssessment`
- [ ] **Task 5** — `packages/team-manager-core/src/saboteur.ts` + `saboteur.test.ts` — TDD: `computeSaboteurScores`, `computePQScore`, `rankTopSaboteurs`, `recommendSagePowers`
- [ ] **Task 6** — `packages/team-manager-core/src/data/saboteurs.ts` + `sage-powers.ts` (verbatim from `docs/ideas/saboteur-implementation-plan.md`)
- [ ] **Task 7** — `packages/team-manager-core/src/data/saboteur-questions.ts` — 50 Likert items + 24 PQ pairs (from spec §3)
- [ ] **Checkpoint 2** — `pnpm --filter @team-manager/core test:run` green; RED→GREEN visible

## Phase 3 — API route (logic, TDD)
- [ ] **Task 8** — `apps/api/src/routes/saboteur.ts` — POST + GET, Zod-validated
- [ ] **Task 9** — Supertest tests: happy path, 400, GET-not-found
- [ ] **Task 10** — Mount router in `apps/api/src/app.ts`
- [ ] **Checkpoint 3** — `pnpm --filter @team-manager/api test:run` green (after building shared + core); curl works

## Phase 4 — Assessment UI
- [ ] **Task 11** — `apps/web/src/pages/Layer3SaboteurAssessmentPage.tsx` (intro → 50 Likert → 24 PQ → submit)
- [ ] **Task 12** — Register `/assessment/layer-3` route; wire "Start" CTA on Growth hub
- [ ] **Task 13** — `layer3.json` strings for assessment flow
- [ ] **Checkpoint 4** — Browser: take full assessment as a member, timed ~10 min, submits cleanly

## Phase 5 — Result view + hub wiring
- [ ] **Task 14** — `apps/web/src/pages/Layer3SaboteurResultPage.tsx` — PQ gauge + 10-saboteur radar + top-3 cards + sage powers + retake
- [ ] **Task 15** — Extract `SaboteurCard.tsx` + `PQGauge.tsx` (library-ready)
- [ ] **Task 16** — Replace Growth hub placeholder with status card (top saboteur + PQ + link, or "Start" CTA if not taken)
- [ ] **Checkpoint 5** — Full flow: Growth → Start → submit → result page → return to Growth, see status

## Phase 6 — Seed + Resonance closure
- [ ] **Task 17** — `seedSaboteurAssessments` in `apps/web/src/seed.ts` (deterministic Mulberry32, all members + managers)
- [ ] **Task 18** — Update `SeedPage.tsx` counters grid (add "Saboteur")
- [ ] **Task 19** — Feature Resonance audit — log follow-ups for `MemberProfileModal`, `MemberDetailPage`, `MemberList`
- [ ] **Task 20** — Audit all user-facing strings → locales, no hardcoded copy
- [ ] **Checkpoint 6 (final)** — Re-seed + manual test as member AND manager AND company (Growth NOT visible to company); `pnpm test:run && pnpm typecheck && pnpm lint && pnpm build` clean
