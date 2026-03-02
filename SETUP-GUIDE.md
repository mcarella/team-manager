# team-manager — Setup Guide

> Football Manager for building balanced teams using leadership archetypes, cultural profiles and technical skills.

## What is team-manager?

team-manager aiuta i manager (e i team) a costruire team bilanciati combinando tre dimensioni per ogni persona:

1. **Leadership Archetype** — 12 domande → 6 score comportamentali → archetipo ORGANIC agility
2. **Cultural Profile** — CVF assessment → radar Clan / Ad-hocracy / Market / Hierarchy
3. **Technical Skills** — lista skill configurabile × 5 livelli (don't know → can teach)

**Output**: Kiviat diagram del bilanciamento del team.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite + Tailwind + shadcn/ui |
| Backend     | Node.js + Express + Zod           |
| Database    | PostgreSQL + Drizzle ORM          |
| Auth        | Supabase Auth                     |
| Deploy      | Vercel (web) + Docker (api)       |
| Test        | Vitest + React Testing Library    |
| Monorepo    | pnpm workspaces + Turborepo       |

---

## Project Structure

```
team-manager/
├── .claude/                    # Claude Code config
│   ├── CLAUDE.md
│   ├── agents/
│   ├── commands/
│   └── skills/
├── apps/
│   ├── web/                    # React frontend
│   │   └── src/
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── assessment/
│   │       │   ├── team/
│   │       │   └── profile/
│   │       ├── hooks/
│   │       ├── lib/
│   │       └── pages/
│   └── api/                    # Express backend
│       └── src/
│           ├── routes/
│           ├── services/
│           ├── db/
│           └── middleware/
├── packages/
│   ├── shared/                 # Shared TypeScript types
│   └── team-manager-core/      # Domain logic (scoring, archetypes, CVF, Kiviat)
├── docs/
│   └── ARCHITECTURE.md
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Quick Start

```bash
# 1. Crea la struttura
mkdir team-manager && cd team-manager
git init

# 2. Apri Claude Code
claude

# 3. Carica il contesto
/init

# 4. Esegui il primo prompt
# Copia PROMPT-000 da PROMPTS-TDD.md
```

---

## Permission Levels (Hackman Model)

| Level            | Team Member può...                        | Manager può...                 |
|------------------|-------------------------------------------|--------------------------------|
| **Manager-led**   | Vedere solo il proprio profilo            | Tutto                         |
| **Self-managing** | Fare i propri assessment                  | Comporre team, vedere tutto    |
| **Self-designing**| Proporre cambi team                       | Approvare composizioni         |
| **Self-governing**| Vedere tutti i profili, gestire peer      | Stesso del team               |

---

## Build Order (segui PROMPTS-TDD.md)

```
000-002  Setup monorepo + config
010      Shared types
020-024  Core domain logic (TDD)
030-035  API routes (TDD)
050-056  Web UI
070-071  Infrastructure
080      Docs
```
