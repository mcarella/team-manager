# team-manager — TDD Prompts

Esegui i prompt in ordine. Ogni prompt ha un prerequisito.

---

## FASE 0: Setup

### PROMPT-000: Monorepo Setup
```
Classifica: config
[skip-tests: tooling]

Crea la struttura monorepo completa per team-manager:

1. `package.json` root con workspaces pnpm
2. `pnpm-workspace.yaml` con apps/* e packages/*
3. `turbo.json` con pipeline: build, test, typecheck, lint
4. `tsconfig.base.json` con strict mode
5. `.gitignore` appropriato
6. `packages/shared/package.json` + `packages/shared/src/index.ts` (vuoto)
7. `packages/team-manager-core/package.json` + `packages/team-manager-core/src/index.ts` (vuoto)
8. `apps/api/package.json` con: express, zod, drizzle-orm, @supabase/supabase-js
9. `apps/web/package.json` con: react, vite, tailwind, shadcn/ui

Verifica: `pnpm install` senza errori.
```
**Dopo:** `git add . && git commit -m "chore: initialize monorepo structure [skip-tests]"`

---

### PROMPT-001: Test & Lint Config
```
Classifica: config
[skip-tests: tooling setup]

Configura il tooling di qualità:

1. Vitest config in `packages/team-manager-core/vitest.config.ts`
2. Vitest config in `apps/api/vitest.config.ts`
3. ESLint config root con TypeScript support
4. Prettier config
5. Script root `package.json`:
   - `pnpm test` → turbo run test
   - `pnpm typecheck` → turbo run typecheck
   - `pnpm lint` → turbo run lint
   - `pnpm build` → turbo run build

Verifica: `pnpm lint` e `pnpm typecheck` girano senza errori (anche se vuoti).
```
**Dopo:** `git add . && git commit -m "chore: add vitest, eslint, prettier config [skip-tests]"`

---

## FASE 1: Shared Types

### PROMPT-010A: Test Shared Types (RED)
```
Classifica: logic
Branch: feat/shared-types

Scrivi SOLO i test per `packages/shared/src/types.test.ts`.
NON scrivere l'implementazione.

Test da scrivere (type guards e validators):

1. isValidSkillLevel(value) → true per 0,1,2,3,4; false per -1, 5, 1.5, "2"
2. isValidLeadershipAnswer(value) → true per 1-10 interi; false per 0, 11, 1.5
3. isValidArchetype(value) → true per 'expert'|'coordinator'|'peer'|'coach'|'strategist'
4. isValidPermissionLevel(value) → true per 4 livelli Hackman
5. CVFCategory type guard: oggetto con 4 chiavi (clan, adhocracy, market, hierarchy) che sommano a 100

Esegui: `pnpm test:run --testPathPattern=shared/src/types`
DEVONO FALLIRE (file non esiste ancora).
```
**Dopo:** `git add . && git commit -m "test(shared): add type guard failing tests"`

### PROMPT-010B: Implement Shared Types (GREEN)
```
Implementa MINIMO codice per far passare i test.

Crea `packages/shared/src/types.ts` con:
- Tutti i TypeScript types/interfaces da CLAUDE.md (User, Organization, LeadershipScores, Archetype, GolemStyle, LeadershipAssessment, CVFScores, CVFAssessment, Skill, SkillLevel, SkillAssessment, TeamMemberProfile, Team, KiviatData, PermissionLevel)
- Type guards: isValidSkillLevel, isValidLeadershipAnswer, isValidArchetype, isValidPermissionLevel
- CVFCategory validator

Esegui: `pnpm test:run --testPathPattern=shared/src/types`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(shared): implement types and type guards"`

---

## FASE 2: Core Domain Logic

### PROMPT-020A: Test Leadership Scoring (RED)
```
Classifica: logic
Branch: feat/leadership-scoring

Scrivi SOLO i test per `packages/team-manager-core/src/leadership.test.ts`.

Test per calculateLeadershipScores(answers: number[]): LeadershipScores:

1. Somma correttamente le coppie (es: q1=8, q11=9 → catalyzing=17)
2. Tutti gli score nel range 2-20
3. Lancia errore se answers.length !== 12
4. Lancia errore se qualsiasi answer fuori range 1-10
5. Input valido [10,10,10,10,10,10,10,10,10,10,10,10] → tutti score = 20
6. Input valido [1,1,1,1,1,1,1,1,1,1,1,1] → tutti score = 2

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/leadership`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(core): add failing leadership scoring tests"`

### PROMPT-020B: Implement Leadership Scoring (GREEN)
```
Implementa MINIMO codice.

Crea `packages/team-manager-core/src/leadership.ts`:
- calculateLeadershipScores(answers: number[]): LeadershipScores
  - pairs: [1+11, 2+9, 3+12, 4+10, 5+7, 6+8] (1-indexed)
  - validates input
- Esporta da index.ts

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/leadership`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(core): implement leadership scoring"`

---

### PROMPT-021A: Test Archetype Calculator (RED)
```
Classifica: logic
Branch: feat/archetype-calculator

Scrivi SOLO i test per `packages/team-manager-core/src/archetype.test.ts`.

Test per determineArchetype(scores: LeadershipScores): Archetype:

1. directing=20, demanding=18 → 'expert'
2. demanding=20, conducting=18 → 'coordinator'
3. conducting=20, coaching=18 → 'peer'
4. coaching=20, catalyzing=18 → 'coach'
5. catalyzing=20, coaching=19, tutti ≥14 → 'strategist'
6. Tie-breaking: se due score uguali, usa ordine gerarchico expert→strategist
7. Tutti score uguali → archetype deterministic (non random)

Test per mapGolemansStyles(scores: LeadershipScores): GolemStyle[]:
8. directing alto → include 'coercive'
9. envisioning alto → include 'authoritative'
10. coaching alto → include 'coaching'
11. Ritorna top 2-3 stili ordinati per score

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/archetype`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(core): add failing archetype calculator tests"`

### PROMPT-021B: Implement Archetype Calculator (GREEN)
```
Implementa MINIMO codice.

Crea `packages/team-manager-core/src/archetype.ts`:
- determineArchetype(scores): Archetype
  - Trova top 2 behavior per score
  - Matcha le coppie dominanti → archetype
  - Fallback: usa il behavior più alto
- mapGolemansStyles(scores): GolemStyle[]
  - Mappa ogni behavior al Goleman style (tabella in CLAUDE.md)
  - Ritorna stili per i top 3 behavior

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/archetype`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(core): implement archetype calculator and Goleman mapping"`

---

### PROMPT-022A: Test CVF Scoring (RED)
```
Classifica: logic
Branch: feat/cvf-scoring

Scrivi SOLO i test per `packages/team-manager-core/src/cvf.test.ts`.

Test per validateCVFCategory(category: CVFCategory): void:
1. { clan:30, adhocracy:30, market:30, hierarchy:10 } → non lancia errore
2. { clan:30, adhocracy:30, market:30, hierarchy:15 } → lancia errore (somma=105)
3. { clan:100, adhocracy:0, market:0, hierarchy:0 } → non lancia errore (estremo valido)
4. Valori negativi → lancia errore

Test per calculateCVFScores(categories: CVFCategory[]): CVFScores:
5. 6 categorie con clan=50/adhocracy=50/market=0/hierarchy=0 → clan=300, adhocracy=300, market=0, hierarchy=0
6. Deve ricevere esattamente 6 categorie, altrimenti lancia errore
7. Score totale sempre = 600 (somma dei 4 quadranti = 6×100)

Test per normalizeCVFScores(scores: CVFScores): CVFScores (0-100%):
8. { clan:300, adhocracy:300, market:0, hierarchy:0 } → { clan:50, adhocracy:50, market:0, hierarchy:0 }

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/cvf`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(core): add failing CVF scoring tests"`

### PROMPT-022B: Implement CVF Scoring (GREEN)
```
Implementa MINIMO codice.

Crea `packages/team-manager-core/src/cvf.ts`:
- validateCVFCategory(category): void — lancia se somma != 100 o valori negativi
- calculateCVFScores(categories): CVFScores — somma per quadrante
- normalizeCVFScores(scores): CVFScores — converti in percentuale (÷600×100)

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/cvf`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(core): implement CVF scoring and normalization"`

---

### PROMPT-023A: Test Kiviat Builder (RED)
```
Classifica: logic
Branch: feat/kiviat-builder

Scrivi SOLO i test per `packages/team-manager-core/src/kiviat.test.ts`.

Test per buildKiviatData(members: TeamMemberProfile[]): KiviatData:

1. Team con 2 Expert e 1 Coach → archetypeDistribution: { expert: 2/3, coach: 1/3, ... resto 0 }
2. Team con tutti gli assessment CVF → cvfAverage è media corretta
3. Team misto con/senza assessment CVF → esclude i membri senza assessment dalla media
4. Skills average: 2 membri con level 4 e 2 per skill 'typescript' → media = 3
5. Membro senza skill assessment → skill non inclusa nella media di quel membro
6. Team vuoto → KiviatData con tutti 0

Test per getTeamBalanceWarnings(kiviat: KiviatData): string[]:
7. Solo 1 archetipo presente → warning "Team manca di diversità di archetipi"
8. CVF quadrante sotto 10% → warning "Profilo culturale sbilanciato: <quadrant>"
9. Nessuna skill con livello ≥3 → warning presente
10. Team bilanciato → array vuoto

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/kiviat`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(core): add failing Kiviat builder tests"`

### PROMPT-023B: Implement Kiviat Builder (GREEN)
```
Implementa MINIMO codice.

Crea `packages/team-manager-core/src/kiviat.ts`:
- buildKiviatData(members): KiviatData
  - archetypeDistribution: conta per archetipo, normalizza su totale
  - cvfAverage: media per quadrante dei soli membri con CVF completato
  - skillsAverage: media per skillId dei valori presenti
- getTeamBalanceWarnings(kiviat): string[]
  - Controlla heuristics da domain skill

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/kiviat`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(core): implement Kiviat diagram data builder"`

---

### PROMPT-024A: Test Permission Checker (RED)
```
Classifica: logic
Branch: feat/permissions

Scrivi SOLO i test per `packages/team-manager-core/src/permissions.test.ts`.

Test per canPerformAction(role, permissionLevel, action): boolean:

Actions: 'fill_own_assessment' | 'view_own_profile' | 'view_other_profiles' | 'compose_teams' | 'manage_skills' | 'manage_org'

1. manager-led + member + fill_own_assessment → false
2. self-managing + member + fill_own_assessment → true
3. self-managing + member + view_other_profiles → false
4. self-designing + member + view_other_profiles → true
5. self-designing + member + compose_teams → true (propose, not approve)
6. self-governing + member + manage_skills → true
7. manager + qualsiasi level + qualsiasi azione eccetto manage_org → true
8. manager + qualsiasi level + manage_org → true
9. self-governing + member + manage_org → false

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/permissions`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(core): add failing permission checker tests"`

### PROMPT-024B: Implement Permission Checker (GREEN)
```
Implementa MINIMO codice.

Crea `packages/team-manager-core/src/permissions.ts`:
- canPerformAction(role, permissionLevel, action): boolean
  - Usa la tabella dei permessi da CLAUDE.md/domain skill
  - Manager ha sempre true eccetto casi specifici
  - Member segue il livello dell'org

Esegui: `pnpm test:run --testPathPattern=team-manager-core/src/permissions`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(core): implement permission checker"`

---

## FASE 3: API

### PROMPT-030: API Project Setup
```
Classifica: config
[skip-tests: project setup]

Setup `apps/api`:

1. `src/index.ts` — Express app con middleware: cors, json, helmet
2. `src/db/schema.ts` — Drizzle schema per tutte le tabelle (da ARCHITECTURE.md)
3. `src/db/index.ts` — Drizzle client con PostgreSQL
4. `src/middleware/auth.ts` — Supabase JWT verification middleware
5. `drizzle.config.ts`
6. Script in package.json: `dev`, `build`, `db:migrate`, `db:push`
7. `.env.example` con DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, PORT

Verifica: `pnpm typecheck` senza errori in apps/api.
```
**Dopo:** `git add . && git commit -m "chore(api): setup Express + Drizzle + Supabase auth [skip-tests]"`

---

### PROMPT-031A: Test Permission Middleware (RED)
```
Classifica: logic
Branch: feat/api-permission-middleware

Scrivi SOLO i test per `apps/api/src/middleware/permission.test.ts`.

Usa supertest + mock Supabase.

Test per requirePermission(action) middleware:

1. Request senza JWT → 401
2. JWT valido + azione permessa → chiama next()
3. JWT valido + azione NON permessa (es: member in manager-led + fill_own) → 403
4. JWT valido + manager + qualsiasi azione → chiama next()
5. Org non trovata → 404

Esegui: `pnpm test:run --testPathPattern=apps/api/src/middleware/permission`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(api): add failing permission middleware tests"`

### PROMPT-031B: Implement Permission Middleware (GREEN)
```
Implementa MINIMO codice.

Crea `apps/api/src/middleware/permission.ts`:
- requirePermission(action: Action): RequestHandler
  - Legge JWT da Authorization header
  - Verifica con Supabase
  - Carica user + org dal DB
  - Usa canPerformAction da team-manager-core
  - Restituisce 401/403/404 quando necessario

Esegui: `pnpm test:run --testPathPattern=apps/api/src/middleware/permission`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(api): implement permission middleware"`

---

### PROMPT-032A: Test Assessment Routes (RED)
```
Classifica: logic
Branch: feat/api-assessments

Scrivi SOLO i test per `apps/api/src/routes/assessments.test.ts`.

POST /assessments/leadership:
1. Body valido (12 answers 1-10) → 201 + { scores, archetype, golemansStyles }
2. Meno di 12 answers → 400
3. Answer fuori range → 400
4. Non autenticato → 401
5. Idempotente: secondo assessment sostituisce il primo

POST /assessments/cvf:
6. Body valido (6 categorie, ognuna somma a 100) → 201 + { results }
7. Categoria che non somma a 100 → 400
8. Non autenticato → 401

GET /assessments/me:
9. Ritorna entrambi gli assessment completati
10. Se non completati → { leadership: null, cvf: null }

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/assessments`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(api): add failing assessment routes tests"`

### PROMPT-032B: Implement Assessment Routes (GREEN)
```
Implementa MINIMO codice.

Crea `apps/api/src/routes/assessments.ts`:
- POST /leadership — valida, calcola scores + archetype, salva DB
- POST /cvf — valida, calcola scores, salva DB
- GET /me — ritorna assessment dell'utente autenticato

Usa:
- Zod per validation
- calculateLeadershipScores + determineArchetype + mapGolemansStyles da core
- calculateCVFScores + normalizeCVFScores da core
- requirePermission('fill_own_assessment') middleware

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/assessments`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(api): implement assessment routes"`

---

### PROMPT-033A: Test Skills Routes (RED)
```
Classifica: logic
Branch: feat/api-skills

Scrivi SOLO i test per `apps/api/src/routes/skills.test.ts`.

GET /skills (org skills list):
1. Autenticato → lista skill dell'org
2. Non autenticato → 401

POST /skills (manager only):
3. Manager crea nuova skill → 201
4. Member prova a creare → 403
5. Nome duplicato nell'org → 409

POST /skills/:skillId/assess:
6. Member valuta propria skill con level valido → 201
7. Level fuori range (< 0 o > 4) → 400
8. Skill non appartiene all'org dell'utente → 404

GET /skills/me:
9. Ritorna tutti gli skill assessment dell'utente

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/skills`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(api): add failing skills routes tests"`

### PROMPT-033B: Implement Skills Routes (GREEN)
```
Implementa MINIMO codice.

Crea `apps/api/src/routes/skills.ts`:
- GET / — lista skill org
- POST / — crea skill (requirePermission('manage_skills'))
- POST /:skillId/assess — valuta skill propria
- GET /me — assessment utente corrente

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/skills`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(api): implement skills routes"`

---

### PROMPT-034A: Test Teams Routes (RED)
```
Classifica: logic
Branch: feat/api-teams

Scrivi SOLO i test per `apps/api/src/routes/teams.test.ts`.

POST /teams:
1. Manager crea team con membri validi → 201 + { team, kiviatData, warnings }
2. Member in self-designing propone team → 201 (pending approval)
3. Member in manager-led prova → 403
4. Membro non appartiene all'org → 400

GET /teams/:teamId:
5. Manager vede team completo con profili
6. Member in manager-led vede solo info base (no altri profili)
7. Member in self-governing vede tutto
8. Team non trovato → 404

GET /teams/:teamId/kiviat:
9. Ritorna KiviatData aggiornato
10. Include warnings da getTeamBalanceWarnings

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/teams`
DEVONO FALLIRE.
```
**Dopo:** `git add . && git commit -m "test(api): add failing teams routes tests"`

### PROMPT-034B: Implement Teams Routes (GREEN)
```
Implementa MINIMO codice.

Crea `apps/api/src/routes/teams.ts`:
- POST / — crea team, calcola kiviat, verifica permessi
- GET /:teamId — ritorna team (filtra profili per permission level)
- GET /:teamId/kiviat — ritorna KiviatData + warnings

Usa buildKiviatData + getTeamBalanceWarnings da core.

Esegui: `pnpm test:run --testPathPattern=apps/api/src/routes/teams`
DEVONO PASSARE.
```
**Dopo:** `git add . && git commit -m "feat(api): implement teams routes"`

---

## FASE 4: Web UI

### PROMPT-050: Web App Setup
```
Classifica: config
[skip-tests: project setup]

Setup `apps/web`:

1. Vite + React 18 + TypeScript config
2. Tailwind CSS config
3. shadcn/ui init con tema neutro
4. React Router v6 setup
5. Supabase client in `src/lib/supabase.ts`
6. API client in `src/lib/api.ts` (fetch wrapper con JWT)
7. Zustand store per auth state
8. Layout base: Sidebar + MainContent

Route structure:
- / → redirect a /login o /dashboard
- /login → Auth page
- /dashboard → Personal profile
- /assessment/leadership → Leadership assessment
- /assessment/cvf → CVF assessment
- /assessment/skills → Skills assessment
- /teams → Team list
- /teams/:id → Team detail + Kiviat
- /org → Organization settings (manager only)

Verifica: `pnpm dev` in apps/web lancia senza errori.
```
**Dopo:** `git add . && git commit -m "chore(web): setup React + Vite + Tailwind + routing [skip-tests]"`

---

### PROMPT-051: Auth UI
```
Classifica: ui
[skip-tests: ui-component]

Implementa il flusso di autenticazione:

1. `src/pages/LoginPage.tsx` — form email/password con Supabase Auth
2. `src/pages/RegisterPage.tsx` — registrazione + seleziona organizzazione
3. `src/components/ProtectedRoute.tsx` — redirect a /login se non autenticato
4. `src/hooks/useAuth.ts` — hook per stato auth Supabase
5. Gestione errori (credenziali errate, email già usata)

Design: card centrata, logo team-manager, shadcn Form + Input + Button.
```
**Dopo:** `git add . && git commit -m "feat(web): implement auth UI [skip-tests]"`

---

### PROMPT-052: Leadership Assessment UI
```
Classifica: ui
[skip-tests: ui-component]

Implementa `src/features/assessment/LeadershipAssessmentPage.tsx`:

1. Wizard multi-step: 12 domande, una per volta (o 4 per pagina)
2. Per ogni domanda: testo completo + slider 1-10 con label "Disagree" / "Agree"
3. Progress bar
4. Preview risultato live: radar chart con i 6 score mentre si risponde
5. Submit → POST /assessments/leadership → mostra archetipo risultante
6. Card risultato: archetipo nome + descrizione + Goleman styles
7. Se assessment già completato: mostra risultato con opzione "Rifai"

Usa recharts o chart.js per il radar (6 assi).
Domande: usa il testo esatto dal PDF Self Assessment.
```
**Dopo:** `git add . && git commit -m "feat(web): implement leadership assessment UI [skip-tests]"`

---

### PROMPT-053: CVF Assessment UI
```
Classifica: ui
[skip-tests: ui-component]

Implementa `src/features/assessment/CVFAssessmentPage.tsx`:

1. 6 sezioni (una per categoria)
2. Per ogni categoria: 4 affermazioni con input numerico
3. Validazione real-time: mostra somma corrente, verde se =100, rosso altrimenti
4. Non permette submit finché tutte le categorie sommano a 100
5. Preview radar chart aggiornato in tempo reale
6. Submit → POST /assessments/cvf → mostra profilo culturale
7. Radar chart risultato con 4 quadranti colorati:
   - Clan: blu
   - Ad-hocracy: verde
   - Market: arancione
   - Hierarchy: grigio

Testo delle 6 domande/opzioni: usa il testo esatto dal PDF CVF.
```
**Dopo:** `git add . && git commit -m "feat(web): implement CVF assessment UI [skip-tests]"`

---

### PROMPT-054: Skills Assessment UI
```
Classifica: ui
[skip-tests: ui-component]

Implementa `src/features/assessment/SkillsAssessmentPage.tsx`:

1. Carica lista skill dell'org (GET /skills)
2. Per ogni skill: nome + descrizione + selector a 5 livelli
3. Selector: 5 button con label (Don't know / Know theory / Autonomous / Master / Can teach)
4. Submit → POST /skills/:id/assess per ogni skill modificata
5. Salvataggio progressivo (ogni skill salvata subito al click)
6. Badge di completamento: X/Y skill valutate

Vista manager aggiuntiva:
7. Pulsante "Aggiungi skill" → modal con nome + descrizione
8. Lista skill con possibilità di eliminare
```
**Dopo:** `git add . && git commit -m "feat(web): implement skills assessment UI [skip-tests]"`

---

### PROMPT-055: Personal Profile Dashboard
```
Classifica: ui
[skip-tests: ui-component]

Implementa `src/pages/DashboardPage.tsx` — profilo personale:

1. Header: nome, ruolo, archetipo badge (se completato)
2. Card "Leadership Assessment":
   - Se completato: radar 6 assi + archetipo + Goleman styles
   - Se non completato: CTA "Fai l'assessment"
3. Card "Cultural Profile":
   - Se completato: radar 4 quadranti CVF
   - Se non completato: CTA "Fai l'assessment"
4. Card "Technical Skills":
   - Lista skill con livello visualizzato come badge colorato
   - Se non completato: CTA "Valuta le tue skill"
5. Completamento overall: progress bar 3 step

Colori archetipi:
- Expert: slate
- Coordinator: blue
- Peer: green
- Coach: purple
- Strategist: amber
```
**Dopo:** `git add . && git commit -m "feat(web): implement personal profile dashboard [skip-tests]"`

---

### PROMPT-056: Team Composer + Kiviat Diagram
```
Classifica: ui
[skip-tests: ui-component]

Implementa il cuore dell'app:

`src/features/team/TeamComposerPage.tsx`:
1. Lista membri org con il loro archetipo e % completamento assessment
2. Drag-and-drop (o selezione checkbox) per aggiungere al team
3. Nome team (input)
4. Bottone "Crea Team" → POST /teams

`src/features/team/TeamDetailPage.tsx`:
1. Nome team + lista membri con archetipo badge
2. **Kiviat Diagram** (radar chart multi-dimensionale):
   - Assi: Expert, Coordinator, Peer, Coach, Strategist (archetipe %)
   - Assi: Clan, Ad-hocracy, Market, Hierarchy (CVF media)
   - Assi: una per ogni skill configurata (livello medio 0-4, normalizzato)
3. Panel "Team Balance Warnings":
   - Lista warning da getTeamBalanceWarnings
   - Badge verde "Team Bilanciato" se nessun warning
4. Schede singoli membri (visibilità dipende da permission level)

Il Kiviat deve essere leggibile con N assi variabili (usa recharts RadarChart).
```
**Dopo:** `git add . && git commit -m "feat(web): implement team composer and Kiviat diagram [skip-tests]"`

---

## FASE 5: Infrastructure

### PROMPT-070: Docker Setup
```
Classifica: config
[skip-tests: docker]

Crea configurazione Docker:

1. `apps/api/Dockerfile` — multi-stage build (node:20-alpine)
2. `apps/web/Dockerfile` — multi-stage build con nginx
3. `docker/docker-compose.yml` con:
   - postgres:15 con volume
   - api service con env vars
   - web service con nginx
   - network interno
4. `docker/.env.example` con tutte le variabili necessarie
5. `docker/nginx.conf` — proxy API requests, serve static web

Verifica: `docker-compose up` lancia tutti i servizi.
```
**Dopo:** `git add . && git commit -m "chore(infra): add Docker and docker-compose [skip-tests]"`

---

### PROMPT-071: CI/CD Pipeline
```
Classifica: config
[skip-tests: ci-cd]

Crea `.github/workflows/ci.yml`:

1. Trigger: push su main, PR verso main
2. Jobs in parallelo:
   - test: `pnpm test`
   - typecheck: `pnpm typecheck`
   - lint: `pnpm lint`
   - build: `pnpm build`
3. Job deploy (solo su push main):
   - Richiede tutti i job precedenti
   - Deploy web su Vercel
   - Build e push Docker image per api

Usa pnpm/action-setup@v2 per installare pnpm.
```
**Dopo:** `git add . && git commit -m "chore(infra): add GitHub Actions CI/CD [skip-tests]"`

---

## FASE 6: Documentation

### PROMPT-080: Final Documentation
```
Classifica: config
[skip-tests: docs]

Completa la documentazione:

1. `README.md` root — overview, quick start, struttura
2. `docs/SETUP.md` — setup locale dettagliato (env vars, DB migration, dev server)
3. `docs/API.md` — tutti gli endpoint documentati con esempi curl
4. Aggiorna `ARCHITECTURE.md` con dettagli implementativi reali
5. `packages/team-manager-core/README.md` — come usare le funzioni core
```
**Dopo:** `git add . && git commit -m "docs: add comprehensive project documentation [skip-tests]"`

---

## Summary

| Range    | Phase          | Type   | Prompts |
|----------|----------------|--------|---------|
| 000-001  | Setup          | config | 2       |
| 010A/B   | Shared types   | logic  | 2       |
| 020A/B   | Leadership scoring | logic | 2    |
| 021A/B   | Archetype calc | logic  | 2       |
| 022A/B   | CVF scoring    | logic  | 2       |
| 023A/B   | Kiviat builder | logic  | 2       |
| 024A/B   | Permissions    | logic  | 2       |
| 030      | API setup      | config | 1       |
| 031A/B   | Auth middleware | logic | 2       |
| 032A/B   | Assessment API | logic  | 2       |
| 033A/B   | Skills API     | logic  | 2       |
| 034A/B   | Teams API      | logic  | 2       |
| 050      | Web setup      | config | 1       |
| 051-056  | Web UI         | ui     | 6       |
| 070-071  | Infrastructure | config | 2       |
| 080      | Docs           | config | 1       |

**Totale: 35 prompt** (14 config/ui + 21 logic — 10 RED + 10 GREEN + 1 middleware)
