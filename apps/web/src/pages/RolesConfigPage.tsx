import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/index.js'

export default function RolesConfigPage() {
  const { roles, addRole, addSkillToRole, removeSkillFromRole, removeRole, currentRole } = useStore()
  const backPath = currentRole === 'company' ? '/company' : currentRole === 'manager' ? '/manager' : '/'

  const [newRoleName, setNewRoleName] = useState('')
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [newSkillNames, setNewSkillNames] = useState<Record<string, string>>({})

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newRoleName.trim()
    if (!name) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (roles.some(r => r.id === id)) return
    addRole({ id, name, skills: [] })
    setNewRoleName('')
    setExpandedRole(id)
  }

  const handleAddSkill = (roleId: string) => {
    const name = (newSkillNames[roleId] ?? '').trim()
    if (!name) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    addSkillToRole(roleId, { id, name })
    setNewSkillNames(prev => ({ ...prev, [roleId]: '' }))
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Roles &amp; Skills</h1>
        <p className="text-gray-500 mt-2">Configure skill sets for each professional role.</p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {roles.map(role => {
          const isExpanded = expandedRole === role.id
          return (
            <div key={role.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-800">{role.name}</h3>
                  <span className="text-xs text-gray-400">{role.skills.length} skills</span>
                </div>
                <span className="text-gray-400 text-sm">{isExpanded ? '−' : '+'}</span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3 border-t border-gray-50">
                  {role.skills.length === 0 && (
                    <p className="text-xs text-gray-400 pt-3">No skills yet. Add one below.</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-3">
                    {role.skills.map(skill => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                        <button
                          onClick={() => removeSkillFromRole(role.id, skill.id)}
                          className="text-indigo-400 hover:text-red-500 transition-colors"
                          title="Remove skill"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillNames[role.id] ?? ''}
                      onChange={e => setNewSkillNames(prev => ({ ...prev, [role.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(role.id) } }}
                      placeholder="New skill name..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddSkill(role.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete role "${role.name}" and all its skills?`)) {
                        removeRole(role.id)
                        setExpandedRole(null)
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 pt-1"
                  >
                    Delete role
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Add new role */}
        <form onSubmit={handleAddRole} className="flex gap-2 pt-4">
          <input
            type="text"
            value={newRoleName}
            onChange={e => setNewRoleName(e.target.value)}
            placeholder="New role name (e.g. QA Engineer)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Add role
          </button>
        </form>
      </div>

      <Link to={backPath} className="text-blue-600 hover:underline text-sm">
        ← Back
      </Link>
    </main>
  )
}
