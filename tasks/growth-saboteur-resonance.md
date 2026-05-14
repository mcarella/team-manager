# Feature Resonance Audit — Saboteur (Layer 3 MVP)

> Generated at the end of the Growth + Saboteur MVP build. Lists places in the
> codebase where Saboteur data **should eventually be surfaced** but is **deferred**
> for this MVP. File follow-ups against these so the gap doesn't go silent.

## Symmetric paths NOT yet covered

### 1. `MemberProfileModal.tsx`
Currently shows: leadership archetype, behavioral L2 sub-profile, CVF, skills.
**Missing**: top saboteur + PQ score for the viewed member.
**Suggested follow-up**: add a "Mental fitness" row showing top saboteur badge + PQ score (read-only, link to member's `/members/:id` page).

### 2. `MemberDetailPage.tsx`
Currently shows: full leadership + L2 + CVF + skills recap for a member.
**Missing**: full saboteur block (radar + top 3 + sage powers) — same chrome as the result page.
**Suggested follow-up**: render `<SaboteurCard />` for the member's top saboteur + PQGauge for their PQ score. Reuse the same components from `Layer3SaboteurResultPage`.

### 3. `MemberList.tsx` / `PeoplePage.tsx`
Currently shows: name, role, leadership archetype chip, behavioral sub-profile chip.
**Missing**: top-saboteur chip (compact, color-coded).
**Suggested follow-up**: add a saboteur chip alongside the existing archetype chips. Reuse `SABOTEUR_PROFILES[id].color` for tint.

### 4. Team views (`TeamDashboardPage`, `ReteamingPage`)
Currently shows: team-level kiviats (archetype distribution, CVF average, skills average).
**Missing**: team-level saboteur distribution (how many of each saboteur on the team).
**Suggested follow-up**: this overlaps with the deferred "Layer 3 team-fit view". File together.

### 5. Peer (360°) saboteur perception
The other layers all have a self ⇄ peer-perceived pair. Saboteur currently has only the self view.
**Missing**: peer-rates-subject endpoint, "How others see your saboteurs" tab.
**Suggested follow-up**: this is a substantial separate feature — out of scope for the MVP plan.

### 6. Library page
`/library/archetypes` exists for L1/L2 archetypes. No equivalent for saboteurs.
**Missing**: `/library/saboteurs` browseable gallery of all 10 saboteur cards.
**Status**: `SaboteurCard` was extracted with the right shape (`size: 'compact' | 'rich'`) so the library page is a single new file when needed.

## Symmetric paths ALREADY covered ✓

- ✓ Member nav (Growth tab)
- ✓ Manager nav (Growth tab)
- ✓ Company nav explicitly excluded (correct — companies don't take personal assessments)
- ✓ Seed coverage (saboteur self-assessments generated for all 22 seeded profiles)
- ✓ SeedPage counters grid (saboteur count surfaces alongside the others)
- ✓ i18n namespace `layer3` registered + all user-facing strings in `locales/en/layer3.json`
- ✓ Domain types in `@team-manager/shared`
- ✓ Reusable components (`SaboteurCard`, `PQGauge`) extracted, library-ready

## Action

These follow-ups should be filed as separate tickets so they don't pile up in a single PR. The MVP is shippable without them — the Growth tab + Saboteur assessment + result view work end-to-end.
