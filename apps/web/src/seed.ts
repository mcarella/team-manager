/**
 * Synthetic data seed for team-manager.
 *
 * Wipes localStorage and rebuilds a full dataset with:
 * - 2 companies / managers
 * - 4 teams (2 per manager)
 * - 20 team members with randomized assessments
 * - Company culture profile
 * - Desired CVF per team
 *
 * Run: import & call seed(), or use the /seed page.
 */

import { DEFAULT_ROLES } from './data/default-roles.js'

// --- RNG helpers ---

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function uuid() {
  return crypto.randomUUID()
}

// --- Name pool ---

const FIRST_NAMES = [
  'Marco', 'Giulia', 'Luca', 'Anna', 'Alessandro', 'Sara', 'Matteo', 'Elena',
  'Federico', 'Chiara', 'Lorenzo', 'Valentina', 'Davide', 'Francesca', 'Andrea',
  'Sofia', 'Simone', 'Martina', 'Tommaso', 'Alice', 'Gabriele', 'Beatrice',
  'Riccardo', 'Laura', 'Nicola', 'Giorgia', 'Pietro', 'Elisa', 'Stefano', 'Camilla',
]

const LAST_NAMES = [
  'Rossi', 'Bianchi', 'Ferrari', 'Romano', 'Esposito', 'Colombo', 'Russo',
  'Ricci', 'Greco', 'Marino', 'Bruno', 'Gallo', 'Conti', 'Mancini', 'Costa',
  'De Luca', 'Giordano', 'Barbieri', 'Moretti', 'Fontana', 'Lombardi', 'Rinaldi',
]

const TEAM_NAMES = [
  'Phoenix', 'Titan', 'Aurora', 'Vanguard', 'Horizon',
  'Nebula', 'Pulse', 'Summit', 'Catalyst', 'Forge',
]

const MANAGER_NAMES = [
  { first: 'Carlo', last: 'Verdi' },
  { first: 'Paola', last: 'Neri' },
]

// --- Generators ---

function makeId(first: string, last: string) {
  return `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, '')}`
}

function generateLeadership(userId: string) {
  const answers = Array.from({ length: 12 }, () => randInt(1, 10))

  // Compute scores using the same pair logic as core
  const pairs: [string, number, number][] = [
    ['catalyzing', 0, 10],
    ['envisioning', 1, 8],
    ['demanding', 2, 11],
    ['coaching', 3, 9],
    ['conducting', 4, 6],
    ['directing', 5, 7],
  ]
  const scores: Record<string, number> = {}
  for (const [name, i, j] of pairs) {
    scores[name!] = answers[i]! + answers[j]!
  }

  // Compute archetype
  const archetypeBehaviors: [string, string, string][] = [
    ['expert', 'directing', 'demanding'],
    ['coordinator', 'demanding', 'conducting'],
    ['peer', 'conducting', 'coaching'],
    ['coach', 'coaching', 'catalyzing'],
    ['strategist', 'catalyzing', 'coaching'],
  ]
  const ranked = archetypeBehaviors
    .map(([arch, primary, secondary]) => ({
      archetype: arch!,
      combined: scores[primary!]! + scores[secondary!]!,
      primary: scores[primary!]!,
    }))
    .sort((a, b) => b.combined - a.combined || b.primary - a.primary)
  const archetype = ranked[0]!.archetype

  const golemansMap: Record<string, string> = {
    directing: 'coercive', envisioning: 'authoritative', demanding: 'pacesetting',
    conducting: 'democratic', coaching: 'coaching', catalyzing: 'visionary',
  }
  const behaviors = archetypeBehaviors.find(([a]) => a === archetype)!
  const golemansStyles = [golemansMap[behaviors[1]!]!, golemansMap[behaviors[2]!]!]

  return {
    userId,
    answers,
    scores: scores as any,
    archetype,
    golemansStyles,
    completedAt: new Date().toISOString(),
  }
}

function generateCVF(userId: string) {
  // Generate 6 categories, each summing to 100
  const categories = Array.from({ length: 6 }, () => {
    const a = randInt(5, 50)
    const b = randInt(5, 50)
    const c = randInt(5, Math.min(50, 100 - a - b - 5))
    const d = 100 - a - b - c
    return { clan: a, adhocracy: b, market: c, hierarchy: d }
  })

  const results = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
  for (const cat of categories) {
    results.clan += cat.clan
    results.adhocracy += cat.adhocracy
    results.market += cat.market
    results.hierarchy += cat.hierarchy
  }

  return {
    userId,
    categories,
    results,
    completedAt: new Date().toISOString(),
  }
}

function generateSkills(userId: string, roleId: string) {
  const role = DEFAULT_ROLES.find(r => r.id === roleId)
  const common = DEFAULT_ROLES.find(r => r.id === 'common')
  const skills: { userId: string; skillId: string; level: number }[] = []

  if (role) {
    for (const s of role.skills) {
      skills.push({ userId, skillId: s.id, level: randInt(0, 4) })
    }
  }
  if (common && roleId !== 'common') {
    for (const s of common.skills) {
      if (!skills.some(sk => sk.skillId === s.id)) {
        skills.push({ userId, skillId: s.id, level: randInt(0, 4) })
      }
    }
  }
  return skills
}

function generateCompanyProfile() {
  const a = randInt(80, 200)
  const b = randInt(80, 200)
  const c = randInt(80, 200)
  const d = 600 - a - b - c
  return { clan: a, adhocracy: b, market: c, hierarchy: Math.max(0, d) }
}

function generateDesiredCVF() {
  const a = randInt(100, 200)
  const b = randInt(100, 200)
  const c = randInt(100, 200)
  const d = 600 - a - b - c
  return { clan: a, adhocracy: b, market: c, hierarchy: Math.max(0, d) }
}

// --- Main seed function ---

export function seed() {
  // Wipe
  localStorage.removeItem('team-manager-store')

  // Generate unique names
  const usedNames = new Set<string>()
  function uniqueName() {
    for (let attempt = 0; attempt < 100; attempt++) {
      const first = pick(FIRST_NAMES)
      const last = pick(LAST_NAMES)
      const id = makeId(first, last)
      if (!usedNames.has(id)) {
        usedNames.add(id)
        return { first, last, id, name: `${first} ${last}` }
      }
    }
    // Fallback
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES) + randInt(1, 99)
    const id = makeId(first, last)
    usedNames.add(id)
    return { first, last, id, name: `${first} ${last}` }
  }

  // Roles to assign members to
  const memberRoles = DEFAULT_ROLES.filter(r => r.id !== 'common').map(r => r.id)

  // Generate 20 members
  const members = Array.from({ length: 20 }, () => {
    const { id, name } = uniqueName()
    const roleId = pick(memberRoles)
    const leadership = generateLeadership(id)
    const cvf = generateCVF(id)
    const skills = generateSkills(id, roleId)

    return {
      user: { id, email: `${id}@example.com`, name, orgId: 'default', role: 'member' as const },
      leadership,
      cvf,
      skills,
    }
  })

  // Generate 4 teams, assign 5 members each
  const shuffled = [...members].sort(() => Math.random() - 0.5)
  const teamNames = [...TEAM_NAMES].sort(() => Math.random() - 0.5).slice(0, 4)
  const teams = teamNames.map((tName, i) => ({
    id: uuid(),
    orgId: 'default',
    name: `Team ${tName}`,
    members: shuffled.slice(i * 5, i * 5 + 5),
  }))

  // Managers: 2 managers, each owns 2 teams
  const managerTeamIds: Record<string, string[]> = {}
  const managers = MANAGER_NAMES.map((m, i) => {
    const id = makeId(m.first, m.last)
    managerTeamIds[id] = teams.slice(i * 2, i * 2 + 2).map(t => t.id)
    return id
  })

  // Company profile
  const companyProfile = generateCompanyProfile()

  // Desired CVF per team
  const teamDesiredCVF: Record<string, { clan: number; adhocracy: number; market: number; hierarchy: number }> = {}
  for (const team of teams) {
    teamDesiredCVF[team.id] = generateDesiredCVF()
  }

  // Build the Zustand persisted state shape
  const state = {
    state: {
      currentRole: null,
      currentUserId: null,
      managerTeamIds,
      members,
      teams,
      skills: [],
      roles: DEFAULT_ROLES,
      companyProfile,
      teamDesiredCVF,
    },
    version: 0,
  }

  localStorage.setItem('team-manager-store', JSON.stringify(state))

  return {
    members: members.length,
    teams: teams.length,
    managers,
    companyProfile,
  }
}
