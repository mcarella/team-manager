# TODO — "Growth" tab (personal development recap)

> Plan: `tasks/growth-recap-plan.md`. Resolve open questions in the plan before
> Phase 4 (Phases 1–3 are pure logic, safe to start in any order).

## Phase 1 — Archetype progression (logic, TDD)
- [ ] T1 — Add `Behavior` type + `getArchetypeProgression(current)` to `packages/team-manager-core/src/leadership.ts`
- [ ] T2 — Tests covering 5 archetypes + null for strategist
- [ ] Checkpoint 1 — core tests green

## Phase 2 — Behavior deltas (logic, TDD)
- [ ] T3 — `computeBehaviorDeltas(self, peer)` in `packages/team-manager-core/src/peer-leadership.ts`
- [ ] T4 — Tests: aligned / blind / hidden / no-peer-data
- [ ] Checkpoint 2 — core tests green

## Phase 3 — Skills picker (logic, TDD)
- [ ] T5 — `pickTopSkillsToImprove(assessments, n=3)` in new `packages/team-manager-core/src/skills.ts`
- [ ] T6 — Tests
- [ ] Checkpoint 3 — core tests green

## Phase 4 — Tab + scaffold
- [ ] T7 — Add `Growth` to `MEMBER_NAV` + `MANAGER_NAV` (before Attitude)
- [ ] T8 — `App.tsx`: drop legacy `/growth → /attitude` redirect, register `<Route path="/growth" element={<GrowthRecapPage />} />`
- [ ] T9 — `apps/web/src/pages/GrowthRecapPage.tsx` with title + section skeletons
- [ ] T10 — `apps/web/src/locales/en/growth.json` + register in `i18n.ts`
- [ ] Checkpoint 4 — typecheck + build clean; tab visible

## Phase 5 — Where you stand
- [ ] T11 — `OAArchetypeCard` + `Layer2ArchetypeCard` side-by-side; empty state when missing

## Phase 6 — Path forward
- [ ] T12 — Progression panel: current → next, ↓ dampen + ↑ amplify chips, copy from locales; strategist "peak" empty state

## Phase 7 — Saboteur antidotes
- [ ] T13 — Fetch `/assessments/saboteur/:userId`; render top 3 as expandable compact `SaboteurCard`; empty state with link to `/attitude`

## Phase 8 — Hidden strengths & blind spots
- [ ] T14 — Fetch peer leadership summary; compute deltas; two columns; empty state when no peer data

## Phase 9 — Skills to improve
- [ ] T15 — Pick top 3 via `pickTopSkillsToImprove`; compact list rows; empty state

## Phase 10 — Polish + verification
- [ ] T16 — Audit: no hardcoded strings
- [ ] T17 — Consistent empty-state copy
- [ ] T18 — `pnpm test:run && pnpm typecheck && pnpm lint && pnpm build`; manual member + manager + company test
