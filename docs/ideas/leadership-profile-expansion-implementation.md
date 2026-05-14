# Leadership Profile Expansion — Implementation Plan

> Piano operativo per implementare i tre layer di assessment:
> OA Goleman Unification, PI Behavioral, Saboteur/Sage Module.

**Prerequisiti**: 50 green tests, domain types in `packages/shared/src/types.ts`,
scoring engine in `packages/team-manager-core/src/leadership.ts`, API routes in
`apps/api/src/routes/assessments.ts`.

**Reference**: [`docs/ideas/leadership-profile-expansion.md`](./leadership-profile-expansion.md)

---

## Phase 1: Goleman Unification

**Goal**: All user-facing labels speak Goleman. OA assessment output includes a
6-axis Goleman radar derived from existing behavior scores.

### 1.1 Shared Types

**File**: `packages/shared/src/types.ts`

```typescript
// Add to existing types

export type GolemanStyle = 'coercive' | 'authoritative' | 'democratic'
                         | 'pacesetting' | 'coaching' | 'visionary'

// 6-axis radar: each style 0-100 (normalized from OA behavior scores 2-20)
export type GolemanRadar = Record<GolemanStyle, number>

// Extend LeadershipAssessment
export interface LeadershipAssessment {
  // ... existing fields ...
  golemanRadar: GolemanRadar  // NEW: 6-axis Goleman radar
}
```

**Note**: `GolemansStyle` (existing) stays for backward compatibility in the
archetype mapping. `GolemanRadar` is the new continuous radar.

### 1.2 Scoring Engine — Goleman Radar

**File**: `packages/team-manager-core/src/leadership.ts`

New function:

```typescript
export function computeGolemanRadar(scores: LeadershipScores): GolemanRadar {
  // Normalize each behavior score (2-20) to 0-100
  // Formula: (score - 2) / 18 * 100
  return {
    coercive:      normalize(scores.directing),
    authoritative: normalize(scores.envisioning),
    pacesetting:   normalize(scores.demanding),
    democratic:    normalize(scores.conducting),
    coaching:      normalize(scores.coaching),
    visionary:     normalize(scores.catalyzing),
  }
}

function normalize(score: number): number {
  return Math.round((score - 2) / 18 * 100)
}
```

### 1.3 Tests

**File**: `packages/team-manager-core/src/leadership.test.ts`

- `computeGolemanRadar` returns all zeros for min scores (all 2s)
- `computeGolemanRadar` returns all 100s for max scores (all 20s)
- `computeGolemanRadar` returns correct normalized values for known inputs
- Radar values always integers 0-100

### 1.4 Static Data — Archetype Cards with Goleman Language

**File**: `packages/team-manager-core/src/data/archetype-cards.ts`

```typescript
export interface ArchetypeCard {
  archetype: Archetype
  golemanPrimary: GolemanStyle
  golemanSecondary: GolemanStyle
  hackmanLevel: string
  motto: string
  description: string
  strengths: string[]
  risks: string[]
  idealContext: string         // Cynefin domain
}
```

5 cards, one per archetype. Content from `docs/references/Archetypes.pdf` +
Goleman HBR mapping.

### 1.5 API Route Update

**File**: `apps/api/src/routes/assessments.ts`

Update `POST /assessments/leadership` response to include `golemanRadar`.

### 1.6 Web — Goleman Radar Chart

**File**: `apps/web/src/components/GolemanRadar.tsx`

Recharts/D3 radar chart showing 6 Goleman axes. Replaces or augments the
existing behavior scores display.

### Deliverables Phase 1
- [ ] `GolemanRadar` type in shared
- [ ] `computeGolemanRadar()` function + tests (TDD)
- [ ] Archetype cards static data
- [ ] API returns `golemanRadar` in leadership assessment response
- [ ] Radar chart component in web app
- [ ] All existing 50 tests still green

**Estimated scope**: ~8 issues, mostly `logic` (TDD) + 1 `ui` (radar chart)

---

## Phase 2: PI Behavioral Layer

**Goal**: Optional deeper assessment that produces a 6-axis Goleman radar
refinement and assigns a descriptive sub-profile label.

### 2.1 Shared Types

**File**: `packages/shared/src/types.ts`

```typescript
// PI Behavioral Assessment

export interface PIFactors {
  dominanza: number      // 0-100
  estroversione: number  // 0-100
  pazienza: number       // 0-100
  formalita: number      // 0-100
}

export type PISubProfile =
  // Coercive family
  | 'direttore' | 'individualista'
  // Authoritative family
  | 'visionario' | 'capitano'
  // Democratic family
  | 'ricercatore' | 'mediatore'
  // Pacesetting family
  | 'esperto' | 'studioso' | 'pioniere' | 'ribelle'
  // Coaching family
  | 'armonizzatore' | 'operatore' | 'artigiano' | 'guardiano'
  // Visionary family
  | 'persuasore' | 'ambasciatore'

export interface PIAssessment {
  userId: string
  answers: number[]            // raw answers (instrument TBD)
  factors: PIFactors
  golemanRadar: GolemanRadar   // refined radar from PI factors
  subProfile: PISubProfile
  completedAt: Date
}
```

### 2.2 Scoring Engine — PI Factors to Goleman Radar

**File**: `packages/team-manager-core/src/pi-behavioral.ts`

```typescript
export function computePIGolemanRadar(factors: PIFactors): GolemanRadar
export function matchSubProfile(factors: PIFactors): PISubProfile
export function validatePIFactors(factors: PIFactors): void
```

**PI → Goleman mapping rules** (from brainstorm):

| Goleman Style | Formula (weighted combination of PI factors) |
|---|---|
| Coercive | `high(dom) + low(estr) + high(form)` |
| Authoritative | `high(dom) + high(estr) + low(paz)` |
| Democratic | `mid(dom) + mid(estr) + high(form)` |
| Pacesetting | `high(dom) + low(estr) + low(paz)` |
| Coaching | `low(dom) + high(paz) + high(form)` |
| Visionary | `high(dom) + high(estr) + low(form)` |

Exact weights TBD during implementation — will need validation against reference
profiles to ensure the 16 sub-profiles land in the right Goleman family.

### 2.3 Sub-profile Matching

**File**: `packages/team-manager-core/src/data/pi-profiles.ts`

Static data: 16 reference profiles with their expected PI factor ranges:

```typescript
export interface PIProfileReference {
  id: PISubProfile
  nameIT: string            // "Il Direttore"
  nameEN: string            // "The Controller"
  golemanFamily: GolemanStyle
  factorRanges: {
    dominanza: [number, number]
    estroversione: [number, number]
    pazienza: [number, number]
    formalita: [number, number]
  }
  strengths: string[]
  risks: string[]
  idealEnvironment: string
  communicationStyle: string
  typicalRoles: string[]
}
```

Matching algorithm: Euclidean distance between user's factors and each
reference profile's center point. Nearest match wins.

### 2.4 Tests

**File**: `packages/team-manager-core/src/pi-behavioral.test.ts`

- Factor validation (0-100 range)
- Goleman radar computation for known factor combinations
- Sub-profile matching: verify all 16 reference profiles correctly classify
- Edge cases: all factors at 50, all at extremes, single dominant factor
- Radar values always 0-100 integers

### 2.5 PI Assessment Questions

**Open question**: The PI assessment instrument (what questions produce the 4
factors) needs to be designed. Options:
- Adapt from existing behavioral assessment literature (DISC-like)
- Use forced-choice pairs (less gameable than Likert)
- Design situational/behavioral questions aligned with the leadership-questions-redesign philosophy

**File**: `packages/team-manager-core/src/data/pi-questions.ts`

### 2.6 API Routes

**File**: `apps/api/src/routes/assessments.ts`

```
POST /assessments/pi-behavioral
  Body: { userId, answers }
  Response: PIAssessment

GET /assessments/pi-behavioral/:userId
  Response: PIAssessment | null
```

### 2.7 Web — Enhanced Profile Card

**Files**:
- `apps/web/src/components/PIAssessmentFlow.tsx` — question flow UI
- `apps/web/src/components/EnrichedProfileCard.tsx` — shows OA archetype + PI sub-profile + combined Goleman radar
- `apps/web/src/pages/PIAssessmentPage.tsx`

### Deliverables Phase 2
- [ ] PI types in shared
- [ ] PI factor validation + tests
- [ ] PI → Goleman radar scoring + tests
- [ ] 16 PI reference profiles static data
- [ ] Sub-profile matching algorithm + tests
- [ ] PI questions (instrument design — may need domain expert review)
- [ ] API routes: POST + GET pi-behavioral
- [ ] Assessment flow UI
- [ ] Enhanced profile card with OA + PI combined view
- [ ] Integration test: OA + PI together

**Estimated scope**: ~12 issues. Scoring is `logic` (TDD). Questions + UI are separate.

---

## Phase 3: Saboteur Module

**Goal**: Separate mental fitness assessment producing saboteur radar, PQ score,
and sage power recommendations. Linked to OA archetype via shadow saboteur mapping.

### 3.1 Shared Types

**File**: `packages/shared/src/types.ts`

```typescript
// Saboteur Assessment

export type SaboteurId =
  | 'judge' | 'stickler' | 'pleaser' | 'hyper_achiever'
  | 'victim' | 'hyper_rational' | 'hyper_vigilant'
  | 'restless' | 'controller' | 'avoider'

export type SagePowerId =
  | 'empathize' | 'explore' | 'innovate' | 'navigate' | 'activate'

export type LikertValue = 1 | 2 | 3 | 4 | 5

export interface SaboteurAssessment {
  userId: string
  saboteurAnswers: Record<number, LikertValue>     // 50 items
  pqAnswers: Record<number, { pos: LikertValue; neg: LikertValue }> // 24 pairs
  saboteurScores: Record<SaboteurId, number>        // 0-10 each
  pqScore: number                                    // 0-100
  topSaboteurs: SaboteurId[]                         // ranked top 3
  recommendedSagePowers: SagePowerId[]               // antidotes for top saboteurs
  completedAt: Date
}
```

### 3.2 Static Data — Saboteur Profiles

**File**: `packages/team-manager-core/src/data/saboteurs.ts`

```typescript
export interface SaboteurProfile {
  id: SaboteurId
  nameIT: string               // "Il Giudice"
  nameEN: string               // "Judge"
  isUniversal: boolean         // true only for Judge
  description: string
  thoughts: string[]           // typical thought patterns
  emotions: string[]           // generated emotions
  justificationLie: string     // the lie it tells
  originalStrength: string     // hijacked strength
  sageAntidotes: SagePowerId[] // 2 sage powers
  origin: string               // evolutionary origin
}
```

10 profiles from `docs/ideas/pq-archetypes-reference-guide.pdf` pages 21-30.

### 3.3 Static Data — Sage Powers

**File**: `packages/team-manager-core/src/data/sage-powers.ts`

```typescript
export interface SagePower {
  id: SagePowerId
  nameIT: string
  nameEN: string
  keyword: string          // "Compassione", "Curiosita", etc.
  description: string
  howToUse: string
  dailyExercise: string
  countersSaboteurs: SaboteurId[]
}
```

5 powers from reference guide page 31.

### 3.4 Static Data — Shadow Saboteur Mapping

**File**: `packages/team-manager-core/src/data/shadow-saboteurs.ts`

```typescript
export interface ShadowSaboteurMapping {
  archetype: Archetype
  defaultGolemanStyles: GolemanStyle[]
  likelySaboteurs: SaboteurId[]       // which saboteurs keep you stuck
  blockedStyles: GolemanStyle[]       // which styles you can't switch to
  coachingFocus: string               // what to work on
}
```

5 mappings (one per archetype) from brainstorm summary section 4.

### 3.5 Scoring Engine — Saboteur Assessment

**File**: `packages/team-manager-core/src/saboteur.ts`

```typescript
// Saboteur scoring
export function computeSaboteurScores(
  answers: Record<number, LikertValue>,
  questions: SaboteurQuestion[]
): Record<SaboteurId, number>

// PQ score
export function computePQScore(
  answers: Record<number, { pos: LikertValue; neg: LikertValue }>
): number

// Sage power recommendation
export function recommendSagePowers(
  topSaboteurs: SaboteurId[],
  saboteurProfiles: SaboteurProfile[]
): SagePowerId[]

// Full assessment
export function computeSaboteurAssessment(
  saboteurAnswers: Record<number, LikertValue>,
  pqAnswers: Record<number, { pos: LikertValue; neg: LikertValue }>,
  questions: SaboteurQuestion[],
): Omit<SaboteurAssessment, 'userId' | 'completedAt'>
```

**Scoring algorithm** (from `docs/ideas/saboteur-implementation-plan.md`):

- 50 questions, 5 per saboteur (except Judge: 5 questions)
- Each answer 1-5 (Likert), some reverse-scored
- Raw score per saboteur = weighted sum of 5 answers
- Normalized to 0-10 scale
- PQ Score = positive emotion average / (positive + negative average) * 100
- Top 3 saboteurs by score
- Sage powers = union of antidotes from top 3 saboteurs, deduplicated, max 3

### 3.6 Question Data

**File**: `packages/team-manager-core/src/data/saboteur-questions.ts`

```typescript
export interface SaboteurQuestion {
  id: string                // "sab_j01"
  saboteurId: SaboteurId
  text: string              // Italian
  textEN?: string           // English (optional)
  reverseScored: boolean
  weight: number            // 1.0 default
}
```

50 questions from `docs/ideas/pq-implementation-plan.md`.

**File**: `packages/team-manager-core/src/data/pq-questions.ts`

```typescript
export interface PQEmotionPair {
  id: string                // "pq_01"
  positive: string
  negative: string
  category?: string
}
```

24 emotion pairs from implementation plan.

### 3.7 Tests

**File**: `packages/team-manager-core/src/saboteur.test.ts`

- Saboteur scoring: known answers → expected scores
- Reverse scoring works correctly
- PQ score: all positive → 100, all negative → 0, mixed → correct ratio
- Top 3 ranking with tiebreaks
- Sage power recommendation deduplication
- Validation: 50 answers required, all 1-5
- Judge always present in scoring (universal saboteur)
- Edge cases: all same answers, single saboteur dominance

### 3.8 API Routes

**File**: `apps/api/src/routes/assessments.ts`

```
POST /assessments/saboteur
  Body: { userId, saboteurAnswers, pqAnswers }
  Response: SaboteurAssessment

GET /assessments/saboteur/:userId
  Response: SaboteurAssessment | null
```

### 3.9 Web — Saboteur Assessment UI

**Files**:
- `apps/web/src/components/saboteur/SaboteurAssessmentFlow.tsx` — 50 Likert questions
- `apps/web/src/components/saboteur/PQAssessmentFlow.tsx` — 24 emotion pairs
- `apps/web/src/components/saboteur/SaboteurRadar.tsx` — 10-axis radar chart
- `apps/web/src/components/saboteur/PQGauge.tsx` — semicircular gauge (0-100)
- `apps/web/src/components/saboteur/SaboteurCard.tsx` — detail card per saboteur
- `apps/web/src/components/saboteur/SagePowerCard.tsx` — antidote card
- `apps/web/src/pages/SaboteurAssessmentPage.tsx`
- `apps/web/src/pages/SaboteurResultsPage.tsx`

### Deliverables Phase 3
- [ ] Saboteur types in shared
- [ ] 10 saboteur profiles static data
- [ ] 5 sage power profiles static data
- [ ] 5 shadow saboteur mappings static data
- [ ] 50 saboteur questions data
- [ ] 24 PQ emotion pair data
- [ ] `computeSaboteurScores()` + tests (TDD)
- [ ] `computePQScore()` + tests (TDD)
- [ ] `recommendSagePowers()` + tests (TDD)
- [ ] API routes: POST + GET saboteur
- [ ] Saboteur assessment flow UI
- [ ] PQ assessment flow UI
- [ ] Saboteur radar chart
- [ ] PQ gauge component
- [ ] Saboteur + Sage cards
- [ ] Results page with full report

**Estimated scope**: ~18 issues. Heavy on `logic` (TDD) + `ui` (charts/cards).

---

## Phase 4: Coaching Integration & Unified Profile

**Goal**: Tie all three layers together in a unified profile view with coaching
insights, Cynefin context mapping, and team-level aggregation.

### 4.1 Shared Types

**File**: `packages/shared/src/types.ts`

```typescript
// Unified Leadership Profile

export interface UnifiedLeadershipProfile {
  user: User
  oa: LeadershipAssessment                // Layer 1 (always)
  pi?: PIAssessment                       // Layer 2 (opt-in)
  saboteur?: SaboteurAssessment           // Layer 3 (separate)
  cvf?: CVFAssessment                     // Existing
  skills: SkillAssessment[]               // Existing
  coaching?: CoachingInsights             // Derived
}

export interface CoachingInsights {
  shadowSaboteurs: SaboteurId[]           // likely saboteurs for this archetype
  blockedStyles: GolemanStyle[]           // styles you struggle to switch to
  coachingFocus: string
  cynefinFit: CynefinMapping
  growthPath: GrowthRecommendation[]
}

export type CynefinDomain = 'clear' | 'complicated' | 'complex' | 'chaotic' | 'confused'

export interface CynefinMapping {
  naturalDomain: CynefinDomain            // where your default style fits
  targetDomains: CynefinDomain[]          // domains you should practice
}

export interface GrowthRecommendation {
  targetStyle: GolemanStyle
  currentStrength: number                 // 0-100 from radar
  blockingSaboteur?: SaboteurId
  sagePower: SagePowerId
  practiceHint: string
}
```

### 4.2 Coaching Engine

**File**: `packages/team-manager-core/src/coaching.ts`

```typescript
export function generateCoachingInsights(
  archetype: Archetype,
  golemanRadar: GolemanRadar,
  saboteur?: SaboteurAssessment
): CoachingInsights

export function generateGrowthPath(
  golemanRadar: GolemanRadar,
  shadowSaboteurs: ShadowSaboteurMapping,
  saboteurScores?: Record<SaboteurId, number>
): GrowthRecommendation[]

export function mapCynefinFit(archetype: Archetype): CynefinMapping
```

### 4.3 Static Data — Cynefin Context Mapping

**File**: `packages/team-manager-core/src/data/cynefin-mapping.ts`

```typescript
export interface CynefinStyleMapping {
  domain: CynefinDomain
  characteristics: string
  primaryStyles: GolemanStyle[]
  naturalArchetype: Archetype[]
  coachingNote: string
}
```

5 domain mappings from brainstorm section 5.

### 4.4 Team-level Saboteur Aggregation

**File**: `packages/team-manager-core/src/kiviat.ts` (extend existing)

```typescript
// Add to existing KiviatData
export interface KiviatData {
  // ... existing fields ...
  saboteurDistribution?: Record<SaboteurId, number>  // count per type in team
  teamPQAverage?: number                              // 0-100
  teamGolemanRadar?: GolemanRadar                     // averaged across members
}
```

### 4.5 API — Unified Profile Endpoint

```
GET /profile/:userId
  Response: UnifiedLeadershipProfile (aggregates all assessments)

GET /teams/:teamId/coaching
  Response: { members: UnifiedLeadershipProfile[], kiviat: KiviatData }
```

### 4.6 Web — Unified Profile Page

**Files**:
- `apps/web/src/pages/UnifiedProfilePage.tsx` — all layers in one view
- `apps/web/src/components/coaching/CoachingInsightsCard.tsx`
- `apps/web/src/components/coaching/GrowthPathCard.tsx`
- `apps/web/src/components/coaching/CynefinMap.tsx`
- `apps/web/src/components/coaching/CoachingConversationTemplate.tsx`
- `apps/web/src/components/team/TeamSaboteurRadar.tsx`
- `apps/web/src/components/team/TeamGolemanRadar.tsx`

### Deliverables Phase 4
- [ ] Unified profile types
- [ ] Coaching insights types
- [ ] Cynefin mapping static data
- [ ] `generateCoachingInsights()` + tests
- [ ] `generateGrowthPath()` + tests
- [ ] `mapCynefinFit()` + tests
- [ ] Team-level saboteur aggregation
- [ ] Unified profile API endpoint
- [ ] Team coaching API endpoint
- [ ] Unified profile page
- [ ] Coaching insights cards
- [ ] Cynefin visualization
- [ ] Team radar views (saboteur + Goleman)

**Estimated scope**: ~15 issues.

---

## Dependency Graph

```
Phase 1 (Goleman Unification)
  |
  ├── Phase 2 (PI Behavioral)
  |     |
  |     └──┐
  |        |
  ├── Phase 3 (Saboteur Module)  ← can run in parallel with Phase 2
  |     |
  |     └──┐
  |        |
  └── Phase 4 (Coaching Integration)  ← depends on 1 + 2 + 3
```

Phase 2 and Phase 3 are **independent** after Phase 1 and can be worked in parallel.

---

## Quality Gates (per phase)

- [ ] `pnpm test` — all tests pass
- [ ] `pnpm typecheck` — no type errors
- [ ] `pnpm lint` — clean
- [ ] `pnpm build` — all packages build
- [ ] New scoring functions have 100% branch coverage
- [ ] Static data validated against reference PDFs

---

## Open Questions (to resolve before/during implementation)

1. **PI assessment instrument**: What specific questions produce the 4 PI factors?
   Needs domain expert design. Placeholder until designed.
2. **PI → Goleman formula weights**: The mapping rules need calibration against
   the 16 reference profiles. May require iterative tuning.
3. **Saboteur question bank**: 50 questions exist in `pq-implementation-plan.md`
   but may need Italian/English review for tone alignment with
   `leadership-questions-redesign.md` philosophy (behavioral, not attitude).
4. **PQ scoring threshold**: PQ 75 = "tipping point" per reference material.
   Confirm this benchmark is correct for our context.
5. **Trademark/IP**: Ensure all nomenclature avoids Positive Intelligence(R)
   trademark. Use "Mental Fitness" or "Saboteur Radar" not "PQ" in public UI.

---

*Implementation plan generated 2026-04-02*
*Total estimated scope: ~53 issues across 4 phases*
*Reference: leadership-profile-expansion.md, pq-archetypes-reference-guide.pdf,
saboteur-implementation-plan.md, leadership_that_gets_results.pdf, TACO Meetup.pdf*
