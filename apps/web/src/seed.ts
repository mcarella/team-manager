/**
 * Synthetic data seed for team-manager.
 *
 * Wipes localStorage and rebuilds a full dataset with:
 * - 2 managers, each owning 2 teams
 * - 4 teams, 5 members each (20 members total)
 * - All self-assessments: leadership, CVF, skills
 * - Peer skill + leadership assessments within teams
 * - Members rating their manager: skills, leadership, CVF
 */

import { DEFAULT_ROLES } from './data/default-roles.js'
import { API_BASE } from './lib/api.js'

// ── RNG helpers ───────────────────────────────────────────────────────────────

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function uuid() {
  return crypto.randomUUID()
}

// ── Name pool ─────────────────────────────────────────────────────────────────

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

// ── Generators ────────────────────────────────────────────────────────────────

function makeId(first: string, last: string) {
  return `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, '')}`
}

function generateLeadership(userId: string) {
  const answers = Array.from({ length: 12 }, () => randInt(1, 10))

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

  return { userId, answers, scores: scores as any, archetype, golemansStyles, completedAt: new Date().toISOString() }
}

function generateCVF(userId: string) {
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

  return { userId, categories, results, completedAt: new Date().toISOString() }
}

function generateSkills(userId: string, roleId: string) {
  const role = DEFAULT_ROLES.find(r => r.id === roleId)
  const common = DEFAULT_ROLES.find(r => r.id === 'common')
  const skills: { userId: string; skillId: string; level: number }[] = []

  if (role) {
    for (const s of role.skills) skills.push({ userId, skillId: s.id, level: randInt(0, 4) })
  }
  if (common && roleId !== 'common') {
    for (const s of common.skills) {
      if (!skills.some(sk => sk.skillId === s.id))
        skills.push({ userId, skillId: s.id, level: randInt(0, 4) })
    }
  }
  return skills
}

function generateDesiredCVF() {
  const a = randInt(100, 200)
  const b = randInt(100, 200)
  const c = randInt(100, 200)
  const d = 600 - a - b - c
  return { clan: a, adhocracy: b, market: c, hierarchy: Math.max(0, d) }
}

// ── Peer assessment helpers ───────────────────────────────────────────────────

type SeedProfile = {
  user: { id: string; role: string }
  skills: { skillId: string; level: number }[]
  leadership: { answers: number[] }
  cvf: { categories: { clan: number; adhocracy: number; market: number; hierarchy: number }[]; results: { clan: number; adhocracy: number; market: number; hierarchy: number } }
}

type SeedTeam = { id: string; members: SeedProfile[] }

function randomEvaluators<T>(pool: T[], count: [number, number]): T[] {
  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, randInt(count[0], Math.min(count[1], pool.length)))
}

async function seedPeerSkillAssessments(
  teams: SeedTeam[],
  managerProfiles: SeedProfile[],
  managerTeamIds: Record<string, string[]>,
): Promise<number> {
  const posts: Promise<Response>[] = []

  function postSkill(assessorId: string, subjectId: string, skillId: string, baseLevel: number) {
    const level = Math.max(0, Math.min(4, baseLevel + randInt(-1, 1)))
    posts.push(fetch(`${API_BASE}/peer-assessments/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessorId, subjectId, skillId, level }),
    }))
  }

  // Peers within teams (2–4 evaluators per member)
  for (const team of teams) {
    for (const subject of team.members) {
      const assessors = randomEvaluators(team.members.filter(m => m.user.id !== subject.user.id), [2, 4])
      for (const assessor of assessors) {
        for (const s of subject.skills) postSkill(assessor.user.id, subject.user.id, s.skillId, s.level)
      }
    }
  }

  // Members → their manager (3–5 evaluators per manager)
  for (const manager of managerProfiles) {
    const managedTeamIds = managerTeamIds[manager.user.id] ?? []
    const teamMembers = teams
      .filter(t => managedTeamIds.includes(t.id))
      .flatMap(t => t.members)
    const evaluators = randomEvaluators(teamMembers, [3, 5])
    for (const evaluator of evaluators) {
      for (const s of manager.skills) postSkill(evaluator.user.id, manager.user.id, s.skillId, s.level)
    }
  }

  await Promise.all(posts)
  return posts.length
}

async function seedPeerLeadershipAssessments(
  teams: { id: string; members: SeedProfile[] }[],
  managerProfiles: SeedProfile[],
  managerTeamIds: Record<string, string[]>,
): Promise<number> {
  const posts: Promise<Response>[] = []

  function postLeadership(assessorId: string, subjectId: string, answers: number[]) {
    // Slightly vary answers for realism
    const varied = answers.map(a => Math.max(1, Math.min(10, a + randInt(-2, 2))))
    posts.push(fetch(`${API_BASE}/peer-assessments/leadership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessorId, subjectId, answers: varied }),
    }))
  }

  // Peers within teams (2–4 evaluators per member)
  for (const team of teams) {
    for (const subject of team.members) {
      const assessors = randomEvaluators(team.members.filter(m => m.user.id !== subject.user.id), [2, 4])
      for (const assessor of assessors) {
        postLeadership(assessor.user.id, subject.user.id, subject.leadership.answers)
      }
    }
  }

  // Members → their manager (3–5 evaluators per manager)
  for (const manager of managerProfiles) {
    const managedTeamIds = managerTeamIds[manager.user.id] ?? []
    const teamMembers = teams
      .filter(t => managedTeamIds.includes(t.id))
      .flatMap(t => t.members)
    const evaluators = randomEvaluators(teamMembers, [3, 5])
    for (const evaluator of evaluators) {
      postLeadership(evaluator.user.id, manager.user.id, manager.leadership.answers)
    }
  }

  await Promise.all(posts)
  return posts.length
}

async function seedPeerCVFAssessments(
  teams: { id: string; members: SeedProfile[] }[],
  managerProfiles: SeedProfile[],
  managerTeamIds: Record<string, string[]>,
): Promise<number> {
  const posts: Promise<Response>[] = []

  // Members → their manager CVF only (CVF is not evaluated between peers)
  for (const manager of managerProfiles) {
    const managedTeamIds = managerTeamIds[manager.user.id] ?? []
    const teamMembers = teams
      .filter(t => managedTeamIds.includes(t.id))
      .flatMap(t => t.members)
    const evaluators = randomEvaluators(teamMembers, [3, 5])
    for (const evaluator of evaluators) {
      // Generate a slightly varied CVF perception
      const categories = manager.cvf.categories.map(cat => {
        const noise = randInt(-8, 8)
        const clan = Math.max(5, Math.min(85, cat.clan + noise))
        const adhocracy = Math.max(5, Math.min(85, cat.adhocracy - noise))
        const remainder = 100 - clan - adhocracy
        const market = Math.max(5, Math.min(remainder - 5, cat.market))
        const hierarchy = remainder - market
        return { clan, adhocracy, market, hierarchy }
      })
      const results = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
      for (const cat of categories) {
        results.clan += cat.clan
        results.adhocracy += cat.adhocracy
        results.market += cat.market
        results.hierarchy += cat.hierarchy
      }
      posts.push(fetch(`${API_BASE}/peer-assessments/cvf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessorId: evaluator.user.id, subjectId: manager.user.id, categories, results }),
      }))
    }
  }

  await Promise.all(posts)
  return posts.length
}

// ── Main seed function ────────────────────────────────────────────────────────

export async function seed() {
  localStorage.removeItem('team-manager-store')

  // Unique name generator
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
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES) + randInt(1, 99)
    const id = makeId(first, last)
    usedNames.add(id)
    return { first, last, id, name: `${first} ${last}` }
  }

  const memberRoles = DEFAULT_ROLES.filter(r => r.id !== 'common').map(r => r.id)

  // 20 members — all with leadership, CVF, and skills
  const members = Array.from({ length: 20 }, () => {
    const { id, name } = uniqueName()
    const roleId = pick(memberRoles)
    return {
      user: { id, email: `${id}@example.com`, name, orgId: 'default', role: 'member' as const },
      leadership: generateLeadership(id),
      cvf: generateCVF(id),
      skills: generateSkills(id, roleId),
    }
  })

  // 4 teams, 5 members each — every member is assigned, no one is left out
  const shuffled = [...members].sort(() => Math.random() - 0.5)
  const teamNames = [...TEAM_NAMES].sort(() => Math.random() - 0.5).slice(0, 4)
  const teams = teamNames.map((tName, i) => ({
    id: uuid(),
    orgId: 'default',
    name: `Team ${tName}`,
    members: shuffled.slice(i * 5, i * 5 + 5),
  }))
  // Sanity check: all members must be in exactly one team
  const assignedIds = new Set(teams.flatMap(t => t.members.map(m => m.user.id)))
  const unassigned = members.filter(m => !assignedIds.has(m.user.id))
  if (unassigned.length > 0) throw new Error(`Seed error: ${unassigned.length} members not assigned to a team`)

  // 2 managers, each owns 2 teams, also have full self-assessments
  const managerTeamIds: Record<string, string[]> = {}
  const managerProfiles = MANAGER_NAMES.map((m, i) => {
    const id = makeId(m.first, m.last)
    managerTeamIds[id] = teams.slice(i * 2, i * 2 + 2).map(t => t.id)
    const roleId = pick(memberRoles)
    return {
      user: { id, email: `${id}@example.com`, name: `${m.first} ${m.last}`, orgId: 'default', role: 'manager' as const },
      leadership: generateLeadership(id),
      cvf: generateCVF(id),
      skills: generateSkills(id, roleId),
    }
  })

  // Desired CVF per team (manager-set target — separate from computed org avg)
  const teamDesiredCVF: Record<string, ReturnType<typeof generateDesiredCVF>> = {}
  for (const team of teams) {
    teamDesiredCVF[team.id] = generateDesiredCVF()
  }

  // memberId → teamId (mirrors managerTeamIds pattern for reliable TopBar lookup)
  const memberTeamId: Record<string, string> = {}
  for (const team of teams) {
    for (const m of team.members) {
      memberTeamId[m.user.id] = team.id
    }
  }

  // Persist to localStorage (no companyProfile — computed from members' CVFs)
  const state = {
    state: {
      currentRole: null,
      currentUserId: null,
      managerTeamIds,
      memberTeamId,
      members: [...members, ...managerProfiles],
      teams,
      skills: [],
      roles: DEFAULT_ROLES,
      teamDesiredCVF,
    },
    version: 0,
  }
  localStorage.setItem('team-manager-store', JSON.stringify(state))

  // Seed all peer assessments in parallel
  const [peerSkills, peerLeadership, peerCVF] = await Promise.all([
    seedPeerSkillAssessments(teams, managerProfiles, managerTeamIds),
    seedPeerLeadershipAssessments(teams, managerProfiles, managerTeamIds),
    seedPeerCVFAssessments(teams, managerProfiles, managerTeamIds),
  ])

  // One representative member per team — so each hint shows a member with a team
  const sampleMembers = teams.map(t => ({ teamName: t.name, userId: t.members[0]!.user.id }))

  return {
    members: members.length,
    teams: teams.length,
    managers: managerProfiles.map(m => m.user.id),
    sampleMembers,
    peerSkills,
    peerLeadership,
    peerCVF,
  }
}
