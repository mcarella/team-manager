# team-manager

Football Manager for building balanced teams using leadership archetypes, cultural profiles, and technical skills.

Branded as **Forma** in the UI — a 3-layer leadership diagnostic pipeline:

1. **Layer 1 — Goleman quick-read (3 min)** — ORGANIC Agility archetype + Goleman style
2. **Layer 2 — Behavioral Core (10 min)** — 86-adjective behavioral profile across 4 drives (Dominance / Extraversion / Patience / Formality) → 17 sub-profiles
3. **Layer 3 — Saboteur Radar (15 min)** — planned

Both layers support **360° peer feedback**: members rate teammates and managers; managers see aggregated peer-perceived profiles alongside their own self-view.

---

## Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`corepack enable && corepack prepare pnpm@latest --activate`)

---

## Install

```bash
pnpm install
```

This installs the monorepo and links the workspace packages (`@team-manager/shared`, `@team-manager/core`, `@team-manager/api`, `@team-manager/web`).

---

## Run the app (API + web, both at once)

From the repo root:

```bash
pnpm dev
```

Turbo runs both `apps/api` and `apps/web` in parallel:

| Service | URL                       | Hot reload |
|---------|---------------------------|------------|
| Web     | http://localhost:5173     | yes (Vite) |
| API     | http://localhost:3001     | yes (tsx)  |

The web app talks to the API via `VITE_API_URL` (defaults to `http://localhost:3001`).

### Run them individually

```bash
# API only
pnpm --filter @team-manager/api dev

# Web only
pnpm --filter @team-manager/web dev
```

### Custom API port

```bash
PORT=4001 pnpm --filter @team-manager/api dev
# then point web at it:
VITE_API_URL=http://localhost:4001 pnpm --filter @team-manager/web dev
```

---

## Seed demo data

The project uses an in-memory API store + Zustand-on-localStorage in the web app (see `docs/localStorage-seed-pattern.md`). To populate everything (2 managers, 4 teams, 20 members, all self-assessments, all peer assessments including Layer 2):

1. Start the dev servers (`pnpm dev`).
2. Open http://localhost:5173/seed
3. Click **"Seed & go to login"**.
4. The page lists sample IDs to log in as (one per team, plus the managers).

> **Note**: the API store is in-memory — restarting the API wipes peer data. Re-seed after every API restart.

---

## Quality gates

```bash
pnpm test          # all packages, watch mode
pnpm test:run      # all packages, single run
pnpm typecheck     # tsc --noEmit everywhere
pnpm lint          # eslint everywhere
pnpm build         # production build for everything
```

Workspace packages (`shared`, `core`) must be built before the API tests run because `vitest` resolves them via `./dist/index.js`:

```bash
pnpm --filter @team-manager/shared build && pnpm --filter @team-manager/core build
pnpm --filter @team-manager/api test:run
```

---

## Project layout

```
team-manager/
├── apps/
│   ├── api/                  Express + Zod, in-memory stores
│   └── web/                  React 18 + Vite + Tailwind + i18next + Recharts
├── packages/
│   ├── shared/               TypeScript domain types
│   └── team-manager-core/    Scoring (leadership, CVF, behavioral core, peer aggregation)
├── docs/
└── .claude/                  Claude Code config + skills
```

---

## More

- Setup planning and TDD workflow: [`SETUP-GUIDE.md`](./SETUP-GUIDE.md)
- Claude Code project config: [`.claude/CLAUDE.md`](./.claude/CLAUDE.md)
- localStorage + Seed Page pattern: [`docs/localStorage-seed-pattern.md`](./docs/localStorage-seed-pattern.md)
