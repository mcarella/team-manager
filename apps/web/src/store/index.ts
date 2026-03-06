import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Team,
  Skill,
  TeamMemberProfile,
  LeadershipAssessment,
  CVFAssessment,
  SkillAssessment,
  User,
} from '@team-manager/shared'

interface StoreState {
  members: TeamMemberProfile[]
  teams: Team[]
  skills: Skill[]

  // Member actions
  addMember: (user: User) => void
  saveLeadershipAssessment: (assessment: LeadershipAssessment) => void
  saveCVFAssessment: (assessment: CVFAssessment) => void
  saveSkillAssessment: (assessment: SkillAssessment) => void

  // Team actions
  addTeam: (team: Omit<Team, 'members'>) => void
  addMemberToTeam: (teamId: string, userId: string) => void

  // Skill actions
  addSkill: (skill: Skill) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      members: [],
      teams: [],
      skills: [],

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

      addSkill: (skill) => {
        const exists = get().skills.some(s => s.id === skill.id)
        if (exists) return
        set(state => ({ skills: [...state.skills, skill] }))
      },
    }),
    {
      name: 'team-manager-store',
    }
  )
)
