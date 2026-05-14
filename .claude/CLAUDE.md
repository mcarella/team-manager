# team-manager — Claude Code Configuration

## Identity
- **Project**: team-manager
- **Purpose**: Football Manager for building balanced teams using leadership archetypes, cultural profiles and technical skills
- **Domain**: organizational-design / team-composition / ORGANIC agility

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Zod
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth
- **Testing**: Vitest + React Testing Library
- **Deploy**: Vercel + Docker
- **Monorepo**: pnpm workspaces + Turborepo

---

## Domain Model

### Leadership Assessment (ORGANIC agility)

12 domande (score 1-10), combinate in coppie:

| Pair   | Behavior      | Max Score |
|--------|---------------|-----------|
| 1 + 11 | Catalyzing    | 20        |
| 2 + 9  | Envisioning   | 20        |
| 3 + 12 | Demanding     | 20        |
| 4 + 10 | Coaching      | 20        |
| 5 + 7  | Conducting    | 20        |
| 6 + 8  | Directing     | 20        |

**Archetype mapping** (dominant behavior pair):

| Archetype    | Primary behaviors       | Hackman level fit  |
|--------------|-------------------------|--------------------|
| Expert       | Directing + Demanding   | Manager-led        |
| Coordinator  | Demanding + Conducting  | Manager-led / Self-managing |
| Peer         | Conducting + Coaching   | Self-managing      |
| Coach        | Coaching + Catalyzing   | Self-designing     |
| Strategist   | Catalyzing + Coaching   | Self-governing     |

**Goleman traits mapping**:

| ORGANIC Behavior | Goleman Style  | Motto                        |
|------------------|----------------|------------------------------|
| Directing        | Coercive       | "Do what I tell you"         |
| Envisioning      | Authoritative  | "Come with me"               |
| Demanding        | Pacesetting    | "Do as I do, now"            |
| Conducting       | Democratic     | "What do you think?"         |
| Coaching         | Coaching       | "Try this"                   |
| Catalyzing       | Visionary      | "See the whole picture"      |

### CVF Assessment (Competing Values Framework)

6 categorie, ogni categoria distribuzione 100 punti su 4 quadranti:

| Quadrant          | Keyword      |
|-------------------|--------------|
| Collaborate/Clan  | People first |
| Create/Ad-hocracy | Innovation   |
| Compete/Market    | Results      |
| Control/Hierarchy | Stability    |

Risultato: somma per quadrante (max 600), visualizzato come radar chart.

### Technical Skills Assessment

- Lista skill configurabile per organizzazione (stessa per tutti i member)
- 5 livelli numerici:

| Level | Label             |
|-------|-------------------|
| 0     | Don't know        |
| 1     | Know theory       |
| 2     | Autonomous        |
| 3     | Master            |
| 4     | Can teach/mentor  |

### Team Balance (Kiviat Diagram)

Aggregazione per team:
- **Archetype distribution**: count per tipo
- **CVF average**: media dei 4 quadranti
- **Skills average**: media per skill

### Permission Model (Hackman)

```typescript
type PermissionLevel = 'manager-led' | 'self-managing' | 'self-designing' | 'self-governing'
```

| Level            | team_member                              | manager                      |
|------------------|------------------------------------------|------------------------------|
| manager-led      | view own profile only                    | full access                  |
| self-managing    | fill own assessments + view own profile  | compose teams, view all      |
| self-designing   | propose team changes                     | approve compositions         |
| self-governing   | view all profiles, peer management       | same as team member          |

---

## TypeScript Interfaces

```typescript
// packages/shared/src/types.ts

interface User {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'manager' | 'member';
}

interface Organization {
  id: string;
  name: string;
  permissionLevel: PermissionLevel;
}

interface LeadershipScores {
  catalyzing: number;   // 2-20
  envisioning: number;
  demanding: number;
  coaching: number;
  conducting: number;
  directing: number;
}

type Archetype = 'expert' | 'coordinator' | 'peer' | 'coach' | 'strategist';

type GoalmanStyle = 'coercive' | 'authoritative' | 'pacesetting' | 'democratic' | 'coaching' | 'visionary';

interface LeadershipAssessment {
  userId: string;
  answers: number[]; // [q1..q12], 1-10
  scores: LeadershipScores;
  archetype: Archetype;
  golemansStyles: GoalmanStyle[];
  completedAt: Date;
}

interface CVFScores {
  clan: number;
  adhocracy: number;
  market: number;
  hierarchy: number;
}

interface CVFAssessment {
  userId: string;
  categories: CVFCategory[]; // 6 categories × 4 values
  results: CVFScores;        // sum per quadrant (0-600)
  completedAt: Date;
}

type SkillLevel = 0 | 1 | 2 | 3 | 4;

interface Skill {
  id: string;
  orgId: string;
  name: string;
  description?: string;
}

interface SkillAssessment {
  userId: string;
  skillId: string;
  level: SkillLevel;
}

interface TeamMemberProfile {
  user: User;
  leadership?: LeadershipAssessment;
  cvf?: CVFAssessment;
  skills: SkillAssessment[];
}

interface Team {
  id: string;
  orgId: string;
  name: string;
  members: TeamMemberProfile[];
}

interface KiviatData {
  archetypeDistribution: Record<Archetype, number>;
  cvfAverage: CVFScores;
  skillsAverage: Record<string, number>; // skillId → avg level
}
```

---

## Workflow: TDD Implementation

### 0. Classifica il tipo di issue
PRIMA di qualsiasi lavoro, classifica:
- `logic` — scoring, calcoli, API, DB, business rules → **Full TDD**
- `ui` — componenti React, layout, Kiviat chart → **Skip tests, visual review**
- `config` — tooling, env, CI/CD, Docker → **Skip tests**

Dichiara la classificazione prima di procedere.

### Steps TDD
1. **Branch**: `git checkout -b <type>/<desc>` (mai su main)
2. **Explore**: @explorer per trovare codice rilevante
3. **Plan**: max 7 passi, attendi approvazione
4. **Test First** _(solo logic)_: scrivi test che falliscono
5. **Verify RED** _(solo logic)_: i test DEVONO fallire
6. **Implement**: codice minimo per far passare
7. **Verify GREEN** _(solo logic)_: i test DEVONO passare
8. **Refactor**: pulizia, test rimangono green
9. **Review**: skill code-review
10. **Report**: summary, chiedi commit

### Skip Protocol
Per `ui`/`config`: usa `[skip-tests]`, documenta motivo nel PR.

---

## Component Reuse & UX Coherence

This app has an established visual + interaction language. New features must inherit it, not invent next to it.

**Before writing any new component**, check whether an existing one (or a small variant via props) already covers the use case:

| Need | Use |
|---|---|
| Archetype/profile card (header, motto, color theme, expandable details) | `OAArchetypeCard` (L1), `Layer2ArchetypeCard` (L2) — both support `size: 'compact' \| 'rich'`, `themeOverride`, `isCurrent` |
| Radar/Kiviat (any score distribution) | `KiviatChart` — supports `overlay` for dual series (self vs peer), `secondaryLabel`, `highlightLabels` |
| Goleman radar (6-axis Goleman distribution) | `GolemanRadarChart` |
| Top-nav tabs within a page | `shared/TabSwitcher` |
| Top-bar entry | add to `MEMBER_NAV` / `MANAGER_NAV` / `COMPANY_NAV` in `TopBar.tsx` |
| Adjective grid (86-adjective L2 selection) | `AdjectiveSelectionGrid` |
| Treemap (categorical frequency) | `AdjectiveTreemap` |
| Time-budget indicator on assessment pages | `TimeBudgetChip` |
| Likert 1-10 sliders for assessments | `LeadershipForm` is the canonical pattern — copy its layout for new Likert flows |
| Empty/placeholder state | dashed `rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50` card with a heading + body + optional CTA — see `Layer3HubPage` placeholder or `LeadershipSummaryView` empty branch |

**Coherence rules** (applies to every new page/component):

1. **Card chrome**: result and chart cards use `rounded-2xl border-2 border-gray-200 bg-white p-5` with an uppercase tracking-widest section heading on top (`text-xs font-semibold uppercase tracking-widest`). Apply archetype/accent color to the heading text *only*, never to the card background.
2. **Color tokens**: derive from `ARCHETYPE_ACCENTS` + `ARCHETYPE_CARD_COLORS` (Layer 1) or per-domain group palettes (Layer 2 sub-profile groups). Never hardcode tailwind colors for archetype-tied UI.
3. **Card sizes**: domain cards (archetype / sub-profile / saboteur / sage power) MUST expose a `size: 'compact' | 'rich'` prop so the same component renders in libraries (compact) and recap pages (rich).
4. **Triad labeling**: archetype names always come from `t('layer1:result.triads.<id>')` so the (archetype, behavior, goleman style) triad stays consistent.
5. **i18n**: zero hardcoded user-facing strings — even placeholder/coming-soon copy goes into the appropriate `locales/en/<namespace>.json`.
6. **Reuse over re-implement**: if you're tempted to copy-paste a card or chart and tweak it, extract a prop on the original instead. Three near-duplicates means an `isCurrent`/`themeOverride`/`size` prop is missing.
7. **Layout grid**: assessment pages = single-column `max-w-3xl` centered. Result pages = `space-y-4` stack of white cards. Multi-panel comparisons (self vs peer) use `grid grid-cols-1 md:grid-cols-2 gap-4`.
8. **Forms**: 10-point Likert sliders, time-budget chip at top, progress bar, submit at bottom, prefetch existing answers on mount (see `RateManagerPage` for the canonical shape).

**Workflow rule**: when starting a new page, list which existing components you'll reuse BEFORE writing JSX. If you can't name at least 2–3 reused components, you're probably reinventing — go look harder.

## Feature Resonance — connect ALL the surfaces

When a feature, concept, or data shape lives in more than one place in the app (assessments, peer views, summaries, seeds, types, API, locales), changes to it MUST land in every resonating surface in the same pass. Never ship a half-wired feature where one path has it and a symmetric path doesn't.

**Always check these symmetric surfaces before declaring done**:

1. **Self ↔ Peer**: a self-assessment usually has a peer counterpart (and vice-versa). Adding/changing one without the other is a bug.
   - Example: Layer 2 self-form ⇄ Layer 2 peer-form in `LeadershipAssessmentPage` "Feedback to Others" ⇄ Layer 2 peer-form in `RateManagerPage`.
2. **Member-rates-X ↔ X-rates-Member**: teammates are rated in `LeadershipAssessmentPage > rate`; managers are rated in `RateManagerPage`. Both paths must move together — `teammates` filter explicitly excludes managers, so `RateManagerPage` is the ONLY path for member→manager evaluation.
3. **Self-view ↔ How-others-see-me view**: any new self output should also surface in the aggregated peer view (heatmap, kiviat, sub-profile, delta).
4. **Domain types ↔ API ↔ Web ↔ Seed ↔ Locales**: a new assessment slice touches all five layers — `packages/shared/src/types.ts`, an API route + zod schema, web pages/components, the synthetic `seed.ts`/`synthetic-*.ts`, and `locales/en/*.json`.
5. **Library page ↔ Result/Recap card**: visual components used in `/library/*` are the same ones rendered in user-facing recap cards. Style/copy changes must stay consistent across both.
6. **Seed coverage**: any new persisted entity must be generated by `seed.ts` so `SeedPage` counters and downstream views are usable without manual data entry.
7. **i18n parity**: every user-facing string lands in `locales/en/*.json` (multilingual-ready — EN-only content but structurally namespaced). No hardcoded strings in components.
8. **Sidebar / progress badges**: when a surface has a "submitted / partially submitted" indicator (e.g. ✓ for L1, ✓✓ for L1+L2), every sibling path that shares that concept must render the same indicator.

**Practical rule**: before reporting a feature complete, grep the codebase for every page/component that already handles the symmetric concept (e.g. `grep -r "peer-assessments/leadership"`) and confirm the new behavior is present in each. If you only edited one of N matches, you're not done.

**When in doubt, ask**: "Where else in the app does this concept already appear, and does my change need to land there too?" — list those locations explicitly before finishing.

## Branching & Commits
- Branch: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `refactor/`
- Commits: `type(scope): description`
- Scopes: `core`, `api`, `web`, `shared`, `infra`

## Quality Gates
- [ ] `pnpm test` passa
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm build` riesce

## Cost Discipline
- **Haiku**: explore, test-gen, pr-prep
- **Sonnet**: implement, review
- **Opus**: architettura only

## localStorage + Seed Pattern

This project uses the **localStorage + Seed Page** rapid-prototyping pattern.
Full reference: [`docs/localStorage-seed-pattern.md`](../docs/localStorage-seed-pattern.md)

**IMPORTANT — opt-in only**: Do NOT propose or apply this pattern (or any part of it — seed file, in-memory API, Zustand persist, role-based login) unless the user explicitly requests it with phrases like:
- "use the seed pattern"
- "add a seed page"
- "set up localStorage state"
- "use the localStorage approach"

Do not suggest it proactively, even when it might seem helpful.

## Skills & Commands
- `/init` — carica contesto progetto
- `/implement <desc>` — workflow TDD
- `/skip-tests <reason>` — bypass per ui/config
- `/cost-check` — token usage
- `test-gen` — auto allo step 4
- `code-review` — auto allo step 9
- `team-manager` — domain knowledge
