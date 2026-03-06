import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

const ROLES = [
  {
    id: 'member' as const,
    label: 'Team Member',
    desc: 'Complete your assessments and export your profile.',
    color: 'bg-blue-600 hover:bg-blue-700',
    icon: 'M',
  },
  {
    id: 'manager' as const,
    label: 'Manager',
    desc: 'Build and analyze your teams.',
    color: 'bg-orange-600 hover:bg-orange-700',
    icon: 'T',
  },
  {
    id: 'company' as const,
    label: 'Company',
    desc: 'Overview all teams and individuals.',
    color: 'bg-purple-600 hover:bg-purple-700',
    icon: 'C',
  },
]

export default function HomePage() {
  const { currentRole, currentUserId, login } = useStore()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<'member' | 'manager' | 'company' | null>(null)
  const [name, setName] = useState('')

  // If already logged in, redirect
  if (currentRole && currentUserId) {
    const dest = currentRole === 'member' ? '/onboarding' : currentRole === 'manager' ? '/manager' : '/company'
    navigate(dest, { replace: true })
    return null
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !name.trim()) return
    login(selectedRole, name.trim())
    const dest = selectedRole === 'member' ? '/onboarding' : selectedRole === 'manager' ? '/manager' : '/company'
    navigate(dest)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Team Manager</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-md">
          Build balanced teams using leadership archetypes and cultural profiles.
        </p>
      </div>

      {!selectedRole ? (
        <div className="w-full max-w-md space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Log in as</p>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-white transition-all ${role.color}`}
            >
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {role.icon}
              </span>
              <div className="text-left">
                <p className="font-semibold">{role.label}</p>
                <p className="text-sm opacity-80">{role.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${
              selectedRole === 'member' ? 'bg-blue-600' : selectedRole === 'manager' ? 'bg-orange-600' : 'bg-purple-600'
            }`}>
              {ROLES.find(r => r.id === selectedRole)?.label}
            </span>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Your name or ID</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. mario.rossi"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-2.5 text-white font-semibold rounded-lg disabled:opacity-40 ${
              selectedRole === 'member' ? 'bg-blue-600 hover:bg-blue-700' : selectedRole === 'manager' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole(null); setName('') }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </form>
      )}
    </main>
  )
}
