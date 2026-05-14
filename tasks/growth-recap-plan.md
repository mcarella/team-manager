# Implementation Plan — "Growth" tab (personal development recap)

> Naming note: the prior "Growth" tab was renamed to "Attitude" earlier in the
> session. This is a NEW tab also called "Growth" but with completely different
> intent — a cross-layer development recap, not the saboteur entry.

## Overview

Add a new top-nav **Growth** tab (member + manager) at `/growth` that gives the
user a single actionable recap of their growth path, aggregating data already
collected by other layers. Read-only, no new assessments, no new API routes.

Sections (top → bottom):

1. **Where you stand** — current Layer 1 archetype + Layer 2 sub-profile chip
2. **Path forward** — archetype progression: current → next, which behavior to *dampen* and which to *amplify*
3. **Top 3 saboteur antidotes** — top 3 saboteurs + their recommended Sage Power antidotes
4. **Hidden strengths & blind spots** — from peer feedback (L1) — where peers see you higher (hidden strength) or lower (blind spot)
5. **Skills to improve** — top 3 lowest-rated self skills

Empty states everywhere — sections with missing source data show a tasteful "complete X to unlock" placeholder rather than disappearing.

---

## Architecture Decisions

1. **One new page** at `/growth` — `GrowthRecapPage.tsx`. No new API routes. All data already lives in the store or is fetched on existing pages.
2. **One new piece of domain knowledge** — the archetype progression sequence and per-step dampen/amplify hints. This is small, testable, lives in `@team-manager/core`.
3. **Reuse existing visuals** — `OAArchetypeCard`, `Layer2ArchetypeCard`, `SaboteurCard` (already has `expandable` + `size` props). No new card components needed.
4. **i18n namespace `growth`** — separate from `layer3` so the two tabs don't share keys by accident.
5. **Reclaim `/growth` route** — drop the legacy `/growth → /attitude` redirect added earlier (rename was minutes old, no real bookmarks at risk).

---

## Archetype Progression — The Domain Logic

| From | To | Dampen | Amplify |
|---|---|---|---|
| Expert       | Coordinator | Directing   | Demanding   |
| Coordinator  | Peer        | Demanding   | Conducting  |
| Peer         | Coach       | Conducting  | Coaching    |
| Coach        | Strategist  | Coaching    | Catalyzing  |
| Strategist   | (peak)      | —           | —           |

This describes the **first move** the user needs to make to shift their primary behavior. The matching shift in the secondary behavior follows naturally once the primary swaps. Captured verbatim from the user's directive.

```ts
// New in packages/team-manager-core/src/leadership.ts
export interface ArchetypeProgression {
  next: Archetype
  dampen: Behavior   // 'catalyzing' | 'envisioning' | 'demanding' | 'coaching' | 'conducting' | 'directing'
  amplify: Behavior
}
export function getArchetypeProgression(current: Archetype): ArchetypeProgression | null
```

`null` for `strategist` (no further archetype in the natural sequence).

---

## Dependency Graph

```
getArchetypeProgression() ──┐
                            ├─ GrowthRecapPage
computeBehaviorDeltas()  ──┤   (read-only aggregator)
                            │
pickTopSkillsToImprove() ──┘

Page reuses existing visuals:
  OAArchetypeCard, Layer2ArchetypeCard, SaboteurCard

Page reads (no new API):
  - store: leadership, behavioralCore, skills
  - GET /assessments/saboteur/:userId
  - GET /peer-assessments/leadership/:userId/summary
```

All three small helpers are TDD'd. The page itself is pure UI (skip-tests).

---

## Open Questions (with recommendations)

1. **Reclaim `/growth`** — drop the legacy redirect to `/attitude`? *Recommend yes — rename was minutes ago.*
2. **Nav position** — between Culture and Attitude, or after Attitude? *Resolved: Growth goes LAST (after Attitude). All other recommendations accepted.*
3. **Skills-to-improve heuristic** — pick lowest-level skills, or weight by role expectations? *Recommend lowest level (level 0 first, then 1, then 2). Role-aware ranking is a follow-up.*
4. **Hidden strength threshold** — reuse the existing ±2-on-20 rule from `LeadershipSummaryView`? *Recommend yes — consistency.*
5. **Empty sections** — render with placeholders or hide? *Recommend always render with placeholders so the page structure is predictable.*
6. **Saboteur antidotes here AND in Attitude result** — keep both? *Recommend yes. Attitude result = the deep dive, Growth = the actionable recap.*

---

## Task List

### Phase 1 — Archetype progression (logic, TDD)

- **Task 1 (S)** — Add `Behavior` type alias + `getArchetypeProgression(current: Archetype)` to `packages/team-manager-core/src/leadership.ts`. Returns `{ next, dampen, amplify } | null`.
- **Task 2 (S)** — Tests: each of 5 archetypes, expected dampen/amplify pair, `null` for strategist.

**Checkpoint 1**: `pnpm --filter @team-manager/core test:run` green.

---

### Phase 2 — Behavior deltas (logic, TDD)

- **Task 3 (S)** — Add `computeBehaviorDeltas(self: LeadershipScores, peer: PeerLeadershipSummary)` to `packages/team-manager-core/src/peer-leadership.ts`. Returns array `{ behavior, self, peer, delta, classification: 'hidden' | 'blind' | 'aligned' }` for all 6 behaviors. Same ±2 threshold as the existing UI.
- **Task 4 (S)** — Tests: aligned, blind spot, hidden strength, missing peer data returns empty array.

**Checkpoint 2**: tests green.

---

### Phase 3 — Skills-to-improve picker (logic, TDD)

- **Task 5 (S)** — Add `pickTopSkillsToImprove(assessments: SkillAssessment[], n = 3): SkillAssessment[]` to a new `packages/team-manager-core/src/skills.ts`. Sort by level ascending (level 0 first); tie-break by skillId for stability. Skip skills already at level 4.
- **Task 6 (S)** — Tests.

**Checkpoint 3**: tests green.

---

### Phase 4 — Tab + page scaffold

- **Task 7 (UI, S)** — Add `Growth` to `MEMBER_NAV` and `MANAGER_NAV` in `TopBar.tsx`, placed BEFORE the Attitude tab. Route: `/growth`.
- **Task 8 (UI, S)** — In `App.tsx`: remove the legacy `/growth → /attitude` redirect; register `<Route path="/growth" element={<GrowthRecapPage />} />`.
- **Task 9 (UI, S)** — Create `apps/web/src/pages/GrowthRecapPage.tsx` with the standard chrome (`min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center`, `max-w-3xl space-y-4`), title + subtitle, and empty section placeholders.
- **Task 10 (UI, XS)** — Create `apps/web/src/locales/en/growth.json` with namespace skeleton. Register in `i18n.ts`.

**Checkpoint 4**: tab visible for member + manager, page loads with section skeletons. `pnpm typecheck && pnpm build` clean.

---

### Phase 5 — Section: Where you stand

- **Task 11 (UI, S)** — Read `member.leadership` + `member.behavioralCore` from the store. Render `OAArchetypeCard` (compact, `isCurrent`) for L1 archetype and `Layer2ArchetypeCard` (compact) for L2 sub-profile side-by-side in a 2-col grid. Empty state when one is missing.

---

### Phase 6 — Section: Path forward (archetype progression)

- **Task 12 (UI, M)** — Compute `getArchetypeProgression(archetype)`. Render a panel that visually shows:
  - Current archetype name (badge, archetype accent color)
  - → arrow
  - Next archetype name (badge, dimmed)
  - Two behavior chips below: `↓ {dampen}` and `↑ {amplify}` with red/green tints
  - One-line guidance copy (from locales).
  - Empty state for strategist: "You're at the apex of the natural sequence" + suggest exploring lateral growth.

---

### Phase 7 — Section: Saboteur antidotes

- **Task 13 (UI, S)** — Fetch saboteur assessment from `/assessments/saboteur/:userId`. Render top 3 saboteurs as compact `SaboteurCard expandable` (reuse — no new component). For each, emphasize the sage antidote already in the card. Empty state: "Take the Attitude assessment to see your saboteurs" with link.

---

### Phase 8 — Section: Hidden strengths & blind spots

- **Task 14 (UI, M)** — Fetch peer leadership summary. Compute `computeBehaviorDeltas(self, peer)`. Render two columns:
  - **Hidden strengths** (classification === 'hidden') — list of `{behavior label, +delta, "peer X / self Y"}`
  - **Blind spots** (classification === 'blind') — same shape, with deltaCSS red instead of green
  - Each item ≤ 1 line. Hover/tap to optionally show motto from `GOLEMAN_MOTTOS`.
  - Empty state when no peer evaluators yet: "Ask peers to rate you on Leadership to unlock this."

---

### Phase 9 — Section: Skills to improve

- **Task 15 (UI, S)** — Read `member.skills` from store. Compute top-3 via `pickTopSkillsToImprove`. Render compact list rows: skill name, current level chip (color-coded), and suggested next level. Empty state: "Complete the Skills self-assessment to see growth priorities."

---

### Phase 10 — Polish + i18n + verification

- **Task 16 (UI, XS)** — Audit: no hardcoded user-facing strings.
- **Task 17 (UI, XS)** — Empty-state copy in `growth.json` reads consistently across sections.
- **Task 18 (verify)** — `pnpm test:run && pnpm typecheck && pnpm lint && pnpm build` all green. Manual test as member + manager + company (Growth NOT visible to company).

---

## Out of Scope

- Saving / tracking growth goals (just a recap, no commitment)
- Manager view of "growth plans for my team"
- AI-generated coaching prompts
- Behavioral-core / CVF deltas vs peer (extension if signal is desired)
- IT translations
- Role-aware skill prioritization (use raw lowest-level for MVP)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Page becomes data-heavy / long scroll | M | Five compact sections, single column, max-w-3xl |
| Empty page for new users (no assessments taken) | H | Each section has a tasteful placeholder + CTA back to the right assessment page |
| Confusion vs Attitude tab | M | Distinct subtitles: Growth = "Your action plan", Attitude = "Where your saboteurs live" |
| Archetype progression oversimplifies — feels prescriptive | M | Copy framed as "the natural next step" not "what you should do"; document the simplification |

---

## Verification (end-to-end)

- [ ] `pnpm test:run` — all packages green (existing + ~6 new tests for the three new helpers)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] `pnpm build` clean
- [ ] Member view: Growth tab present, page renders all 5 sections (filled where data exists, placeholders elsewhere)
- [ ] Manager view: Growth tab present
- [ ] Company view: Growth tab NOT present
- [ ] Strategist user sees the "peak" empty state for Path Forward
- [ ] User with no peer feedback yet sees the placeholder for Hidden / Blind
- [ ] User who hasn't taken Attitude sees the placeholder for Saboteur antidotes
