import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Team,
  Skill,
  SkillRole,
  TeamMemberProfile,
  LeadershipAssessment,
  CVFAssessment,
  CVFScores,
  SkillAssessment,
  User,
} from '@team-manager/shared'
import { DEFAULT_ROLES } from '../data/default-roles.js'

type AppRole = 'member' | 'manager' | 'company'

interface StoreState {
  // Session
  currentRole: AppRole | null
  currentUserId: string | null
  managerTeamIds: Record<string, string[]> // managerId → teamIds they own

  // Data
  members: TeamMemberProfile[]
  teams: Team[]
  skills: Skill[]
  roles: SkillRole[]
  companyProfile: CVFScores | null
  teamDesiredCVF: Record<string, CVFScores> // teamId → desired CVF

  // Session actions
  login: (role: AppRole, userId: string) => void
  logout: () => void
  assignTeamToManager: (managerId: string, teamId: string) => void

  // Member actions
  addMember: (user: User) => void
  saveLeadershipAssessment: (assessment: LeadershipAssessment) => void
  saveCVFAssessment: (assessment: CVFAssessment) => void
  saveSkillAssessment: (assessment: SkillAssessment) => void

  // Team actions
  addTeam: (team: Omit<Team, 'members'>) => void
  addMemberToTeam: (teamId: string, userId: string) => void
  importMemberToTeam: (teamId: string, profile: TeamMemberProfile) => void

  // Company actions
  saveCompanyProfile: (profile: CVFScores) => void
  saveTeamDesiredCVF: (teamId: string, profile: CVFScores) => void

  // Skill actions
  addSkill: (skill: Skill) => void

  // Role actions
  addRole: (role: SkillRole) => void
  addSkillToRole: (roleId: string, skill: { id: string; name: string }) => void
  removeSkillFromRole: (roleId: string, skillId: string) => void
  removeRole: (roleId: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      currentUserId: null,
      managerTeamIds: {},

      members: [],
      teams: [],
      skills: [],
      roles: DEFAULT_ROLES,
      companyProfile: null,
      teamDesiredCVF: {},

      login: (role, userId) => {
        const trimmed = userId.trim()
        if (!trimmed) return
        set({ currentRole: role, currentUserId: trimmed })
        // Auto-create member profile for team members
        if (role === 'member') {
          const exists = get().members.some(m => m.user.id === trimmed)
          if (!exists) {
            set(state => ({
              members: [...state.members, {
                user: { id: trimmed, email: '', name: trimmed, orgId: 'default', role: 'member' },
                skills: [],
              }],
            }))
          }
        }
      },

      logout: () => set({ currentRole: null, currentUserId: null }),

      assignTeamToManager: (managerId, teamId) => {
        set(state => {
          const current = state.managerTeamIds[managerId] ?? []
          if (current.includes(teamId)) return state
          return { managerTeamIds: { ...state.managerTeamIds, [managerId]: [...current, teamId] } }
        })
      },

      addMember: (user) => {
        const exists = get().members.some(m => m.user.id === user.id)
        if (exists) return
        set(state => ({
          members: [...state.members, { user, skills: [] }],
        }))
      },

      saveLeadershipAssessment: (assessment) => {
        set(state => ({
          members: state.members.map(m =>
            m.user.id === assessment.userId
              ? { ...m, leadership: assessment }
              : m
          ),
        }))
      },

      saveCVFAssessment: (assessment) => {
        set(state => ({
          members: state.members.map(m =>
            m.user.id === assessment.userId
              ? { ...m, cvf: assessment }
              : m
          ),
        }))
      },

      saveSkillAssessment: (assessment) => {
        set(state => ({
          members: state.members.map(m => {
            if (m.user.id !== assessment.userId) return m
            const skills = m.skills.filter(s => s.skillId !== assessment.skillId)
            return { ...m, skills: [...skills, assessment] }
          }),
        }))
      },

      addTeam: (team) => {
        const exists = get().teams.some(t => t.id === team.id)
        if (exists) return
        set(state => ({
          teams: [...state.teams, { ...team, members: [] }],
        }))
      },

      addMemberToTeam: (teamId, userId) => {
        set(state => {
          const member = state.members.find(m => m.user.id === userId)
          if (!member) return state
          return {
            teams: state.teams.map(t =>
              t.id === teamId && !t.members.some(m => m.user.id === userId)
                ? { ...t, members: [...t.members, member] }
                : t
            ),
          }
        })
      },

      importMemberToTeam: (teamId, profile) => {
        set(state => ({
          teams: state.teams.map(t => {
            if (t.id !== teamId) return t
            const idx = t.members.findIndex(m => m.user.id === profile.user.id)
            const members = idx >= 0
              ? t.members.map((m, i) => i === idx ? profile : m)
              : [...t.members, profile]
            return { ...t, members }
          }),
        }))
      },

      saveCompanyProfile: (profile) => set({ companyProfile: profile }),

      saveTeamDesiredCVF: (teamId, profile) => {
        set(state => ({
          teamDesiredCVF: { ...state.teamDesiredCVF, [teamId]: profile },
        }))
      },

      addSkill: (skill) => {
        const exists = get().skills.some(s => s.id === skill.id)
        if (exists) return
        set(state => ({ skills: [...state.skills, skill] }))
      },

      addRole: (role) => {
        const exists = get().roles.some(r => r.id === role.id)
        if (exists) return
        set(state => ({ roles: [...state.roles, role] }))
      },

      addSkillToRole: (roleId, skill) => {
        set(state => ({
          roles: state.roles.map(r => {
            if (r.id !== roleId) return r
            if (r.skills.some(s => s.id === skill.id)) return r
            return { ...r, skills: [...r.skills, skill] }
          }),
        }))
      },

      removeSkillFromRole: (roleId, skillId) => {
        set(state => ({
          roles: state.roles.map(r =>
            r.id === roleId
              ? { ...r, skills: r.skills.filter(s => s.id !== skillId) }
              : r
          ),
        }))
      },

      removeRole: (roleId) => {
        set(state => ({
          roles: state.roles.filter(r => r.id !== roleId),
        }))
      },
    }),
    {
      name: 'team-manager-store',
    }
  )
)
