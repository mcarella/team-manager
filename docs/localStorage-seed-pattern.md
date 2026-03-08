# localStorage + Seed Page Pattern

A rapid-prototyping pattern for React apps that eliminates backend/auth friction during early development. The full state lives in `localStorage`, a `/seed` page generates coherent synthetic data, and real API calls are made only for volatile data (peer assessments, events) that shouldn't survive a page refresh.

---

## When to use it

- You're building a multi-role app and want to test all roles without a real auth system
- The data model is complex enough that manual test data would be painful
- You want Claude (or any dev) to iterate fast without spinning up a DB
- You plan to replace with a real backend later — this is explicitly throwaway infrastructure

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  localStorage (Zustand persist)                     │
│  - users, roles, teams, assessments, preferences    │
│  - survives page refresh, cleared by seed           │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  In-memory API (Express, in-memory arrays)          │
│  - volatile data: peer ratings, events, messages    │
│  - lost on server restart → re-seed to repopulate   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  /seed page                                         │
│  - wipes localStorage                               │
│  - generates coherent synthetic state               │
│  - POSTs volatile data to API                       │
│  - shows login hints for each role                  │
└─────────────────────────────────────────────────────┘
```

---

## 1. State management: Zustand + persist

```ts
// store/index.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  currentUserId: string | null
  currentRole: 'member' | 'manager' | 'company' | null
  members: TeamMemberProfile[]
  teams: Team[]
  // ... domain state
  login: (userId: string, role: Role) => void
  logout: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      currentRole: null,
      members: [],
      teams: [],
      login: (userId, role) => set({ currentUserId: userId, currentRole: role }),
      logout: () => set({ currentUserId: null, currentRole: null }),
      // ...actions
    }),
    { name: 'my-app-store' }
  )
)
```

**Key decisions:**
- One store, one `localStorage` key
- `currentRole` drives routing and nav — no real auth needed
- Actions are pure store mutations; no API calls for core domain data

---

## 2. Login page: role-based, no password

```tsx
// pages/HomePage.tsx
const ROLES = ['member', 'manager', 'company'] as const

export default function HomePage() {
  const { login } = useStore()
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<Role>('member')
  const navigate = useNavigate()

  const handleLogin = () => {
    if (!userId.trim()) return
    login(userId.trim(), role)
    navigate(role === 'member' ? '/dashboard' : `/${role}`)
  }

  return (
    // role picker + userId input + login button
    // hint: "use a seeded userId, e.g. marco.rossi"
  )
}
```

**Pattern:** userId is just a string — it must match what the seed generated. The seed page shows which IDs to use.

---

## 3. The seed file: `src/seed.ts`

Single exported `seed()` function. Wipes localStorage, generates synthetic data, POSTs volatile data to the API.

```ts
export async function seed() {
  // 1. Wipe
  localStorage.removeItem('my-app-store')

  // 2. Generate domain entities
  const members = generateMembers(20)
  const teams   = assignToTeams(members, 4)
  const managers = generateManagers(2, teams)

  // 3. Write to localStorage (Zustand persist format)
  const state = {
    state: { members: [...members, ...managers], teams, /* ... */ },
    version: 0,
  }
  localStorage.setItem('my-app-store', JSON.stringify(state))

  // 4. Seed volatile API data
  const [peerSkills, peerLeadership] = await Promise.all([
    seedPeerSkills(teams, managers),
    seedPeerLeadership(teams, managers),
  ])

  // 5. Return summary for display
  return {
    members: members.length,
    teams: teams.length,
    managers: managers.map(m => m.user.id),
    sampleMembers: members.slice(0, 3).map(m => m.user.id),
    peerSkills,
    peerLeadership,
  }
}
```

### Generator conventions

```ts
// Deterministic enough to be readable, random enough to be interesting
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

// IDs are human-readable: "marco.rossi", "carlo.verdi"
function makeId(first: string, last: string) {
  return `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, '')}`
}

// Unique name pool to avoid duplicates
const usedNames = new Set<string>()
function uniqueName() { /* pick + dedupe */ }
```

### Seeding volatile API data

```ts
async function seedPeerAssessments(
  teams: SeedTeam[],
  managers: SeedProfile[],
  managerTeamIds: Record<string, string[]>,
): Promise<number> {
  const posts: Promise<Response>[] = []

  // Pattern: N random evaluators per subject
  function randomEvaluators<T>(pool: T[], [min, max]: [number, number]): T[] {
    return [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(min, Math.min(max, pool.length)))
  }

  // Peers within teams
  for (const team of teams) {
    for (const subject of team.members) {
      const assessors = randomEvaluators(
        team.members.filter(m => m.user.id !== subject.user.id),
        [2, 4]
      )
      for (const assessor of assessors) {
        posts.push(fetch(`${API}/peer-assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessorId: assessor.user.id, subjectId: subject.user.id, /* data */ }),
        }))
      }
    }
  }

  // Members → manager
  for (const manager of managers) {
    const managedTeamIds = managerTeamIds[manager.user.id] ?? []
    const teamMembers = teams
      .filter(t => managedTeamIds.includes(t.id))
      .flatMap(t => t.members)
    const evaluators = randomEvaluators(teamMembers, [3, 5])
    for (const evaluator of evaluators) {
      posts.push(/* similar POST */)
    }
  }

  await Promise.all(posts)
  return posts.length
}
```

---

## 4. The `/seed` page

```tsx
// pages/SeedPage.tsx
export default function SeedPage() {
  const [result, setResult] = useState<SeedResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main>
      <h1>Seed Test Data</h1>
      <p>Wipes localStorage and generates a full synthetic dataset.</p>

      <div>
        {/* Seed only — inspect result */}
        <button onClick={async () => { setResult(await seed()) }}>
          Seed data
        </button>
        {/* Seed + redirect to login */}
        <button onClick={async () => { await seed(); window.location.href = '/' }}>
          Seed & go to login
        </button>
      </div>

      {result && (
        <div>
          {/* Summary stats */}
          <p>{result.members} members · {result.teams} teams</p>
          <p>{result.peerSkills} skill ratings · {result.peerLeadership} leadership ratings</p>

          {/* Login hints per role */}
          <section>
            <h3>Login as manager:</h3>
            {result.managers.map(id => <code key={id}>{id}</code>)}
          </section>
          <section>
            <h3>Login as member:</h3>
            {result.sampleMembers.map(id => <code key={id}>{id}</code>)}
          </section>
          <section>
            <h3>Login as company:</h3>
            <code>any name</code>
          </section>
        </div>
      )}
    </main>
  )
}
```

**Route:** Keep `/seed` out of the normal nav. Add to `NO_TOPBAR` set so it renders without chrome.

---

## 5. In-memory API (Express)

```ts
// routes/peer-assessments.ts
const store: PeerAssessment[] = []

export function _resetStore() { store.length = 0 }  // for tests

router.post('/', (req, res) => {
  // Zod validation
  // Self-eval guard: assessorId !== subjectId
  // Upsert by (assessorId, subjectId, [skillId]):
  const idx = store.findIndex(a =>
    a.assessorId === data.assessorId && a.subjectId === data.subjectId
  )
  if (idx >= 0) store[idx] = assessment
  else store.push(assessment)
  res.status(201).json(assessment)
})

router.get('/:subjectId/summary', (req, res) => {
  const summary = aggregateAssessments(req.params.subjectId, store)
  res.json(summary)
})
```

**Key decisions:**
- Always upsert (last write wins per assessor+subject) — makes re-seeding idempotent
- `_resetStore()` exported for API tests
- Aggregation logic lives in `@team-manager/core`, fully unit-tested

---

## 6. What to put where

| Data | Where | Why |
|---|---|---|
| User profiles, teams, roles | `localStorage` | Stable, survives refresh |
| Self-assessments (leadership, CVF, skills) | `localStorage` | Owned by user, stable |
| Peer assessments | In-memory API | Many-to-many, volatile, anonymous |
| App preferences, UI state | `localStorage` | Cheap to persist |
| Auth tokens, sessions | Nowhere — fake it | Not needed yet |

---

## 7. Computed vs stored values

Prefer computing derived data on the fly rather than storing it:

```ts
// ❌ Don't store companyProfile manually — it becomes stale
state.companyProfile = { clan: 200, adhocracy: 150, ... }

// ✅ Compute from members at render time
const membersWithCVF = members.filter(m => m.cvf)
const orgCVF = membersWithCVF.length > 0
  ? computeKiviatData(membersWithCVF).cvfAverage
  : null
```

This keeps the seed simpler and avoids out-of-sync derived state.

---

## 8. Checklist for a new project

- [ ] Install Zustand + `zustand/middleware` (persist)
- [ ] Define store shape with `currentUserId` + `currentRole`
- [ ] Build role-aware login page (no password)
- [ ] Create `src/seed.ts` with `seed()` export
- [ ] Create `/seed` route — excluded from TopBar, not linked from nav
- [ ] Add `_resetStore()` to in-memory API routes for test isolation
- [ ] Seed page shows login hints per role after seeding
- [ ] "Seed & go to login" button for fast iteration loop
- [ ] Keep seed file in sync with domain model as it evolves

---

## 9. The iteration loop

```
1. Change domain model / UI
2. Go to /seed → "Seed & go to login"
3. Login as the relevant role
4. Verify the feature
5. Repeat
```

Total time per cycle: ~5 seconds. No migrations, no fixtures, no test accounts to manage.
