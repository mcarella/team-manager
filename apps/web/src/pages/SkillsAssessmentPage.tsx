import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

const LEVEL_LABELS: Record<number, string> = {
  0: 'Don\'t know',
  1: 'Know theory',
  2: 'Autonomous',
  3: 'Master',
  4: 'Can teach',
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-500 border-gray-200',
  1: 'bg-blue-50 text-blue-600 border-blue-200',
  2: 'bg-green-50 text-green-700 border-green-200',
  3: 'bg-purple-50 text-purple-700 border-purple-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
}

const LEVEL_ACTIVE: Record<number, string> = {
  0: 'bg-gray-400 text-white border-gray-400',
  1: 'bg-blue-500 text-white border-blue-500',
  2: 'bg-green-600 text-white border-green-600',
  3: 'bg-purple-600 text-white border-purple-600',
  4: 'bg-amber-500 text-white border-amber-500',
}

export default function SkillsAssessmentPage() {
  const { currentUserId, saveSkillAssessment, members, roles } = useStore()
  const navigate = useNavigate()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [levels, setLevels] = useState<Record<string, number>>({})

  const userId = currentUserId ?? ''
  if (!userId) {
    navigate('/', { replace: true })
    return null
  }

  const existingSkills = members.find(m => m.user.id === userId)?.skills ?? []
  const selectedRole = roles.find(r => r.id === selectedRoleId)
  const commonRole = roles.find(r => r.id === 'common')

  const allSkills = (() => {
    const roleSkills = selectedRole?.skills ?? []
    const commonSkills = (commonRole && selectedRoleId !== 'common')
      ? commonRole.skills.filter(cs => !roleSkills.some(rs => rs.id === cs.id))
      : []
    return [...roleSkills, ...commonSkills]
  })()

  const handleStart = () => {
    if (!selectedRoleId) return
    const prefill: Record<string, number> = {}
    for (const s of allSkills) prefill[s.id] = 0
    for (const sa of existingSkills) {
      if (sa.skillId in prefill) prefill[sa.skillId] = sa.level
    }
    setLevels(prefill)
    setStarted(true)
    setSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    for (const skill of allSkills) {
      saveSkillAssessment({
        userId,
        skillId: skill.id,
        level: (levels[skill.id] ?? 0) as 0 | 1 | 2 | 3 | 4,
      })
    }
    setSaved(true)
  }

  const setLevel = (skillId: string, level: number) => {
    setLevels(prev => ({ ...prev, [skillId]: level }))
    setSaved(false)
  }

  const roleSpecificSkills = selectedRole?.skills ?? []
  const commonSkills = (commonRole && selectedRoleId !== 'common')
    ? commonRole.skills.filter(cs => !roleSpecificSkills.some(rs => rs.id === cs.id))
    : []

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Skills Assessment</h1>
        <p className="text-gray-500 mt-2">Pick your role, then rate your proficiency on each skill.</p>
      </div>

      {!started ? (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Your role</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.filter(r => r.id !== 'common').map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${
                    selectedRoleId === role.id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  {role.name}
                  <span className="block text-xs mt-0.5 opacity-70">{role.skills.length} skills</span>
                </button>
              ))}
            </div>
          </div>

          {existingSkills.length > 0 && (
            <p className="text-xs text-amber-600">You have a saved skills assessment. Start to update it.</p>
          )}

          <button
            onClick={handleStart}
            disabled={!selectedRoleId}
            className="py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              {selectedRole?.name}
            </span>
            {commonSkills.length > 0 && (
              <span className="text-xs text-gray-400">+ {commonSkills.length} cross-role skills</span>
            )}
          </div>

          {roleSpecificSkills.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {selectedRole?.name} Skills
              </h3>
              {roleSpecificSkills.map(skill => (
                <SkillRow
                  key={skill.id}
                  name={skill.name}
                  level={levels[skill.id] ?? 0}
                  onSetLevel={lvl => setLevel(skill.id, lvl)}
                />
              ))}
            </div>
          )}

          {commonSkills.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Cross-Role Skills
              </h3>
              {commonSkills.map(skill => (
                <SkillRow
                  key={skill.id}
                  name={skill.name}
                  level={levels[skill.id] ?? 0}
                  onSetLevel={lvl => setLevel(skill.id, lvl)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
            >
              Save skills
            </button>
            {saved && (
              <span className="text-sm text-green-700 font-medium">Saved!</span>
            )}
          </div>

          {saved && (
            <div className="flex gap-4 pt-2">
              <Link to="/onboarding" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                Continue
              </Link>
            </div>
          )}
        </form>
      )}
    </main>
  )
}

function SkillRow({ name, level, onSetLevel }: { name: string; level: number; onSetLevel: (lvl: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-800">{name}</p>
      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2, 3, 4].map(lvl => (
          <button
            key={lvl}
            type="button"
            onClick={() => onSetLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              level === lvl
                ? LEVEL_ACTIVE[lvl]
                : LEVEL_COLORS[lvl] + ' hover:opacity-80'
            }`}
          >
            {lvl} — {LEVEL_LABELS[lvl]}
          </button>
        ))}
      </div>
    </div>
  )
}
