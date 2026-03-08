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
