import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

interface NavItem {
  label: string
  to: string
  end?: boolean
}

const MEMBER_NAV: NavItem[] = [
  { label: 'Dashboard',  to: '/onboarding', end: true },
  { label: 'Leadership', to: '/assessment/leadership' },
  { label: 'Skills',     to: '/assessment/skills' },
  { label: 'Culture',    to: '/assessment/cvf' },
]

const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard',  to: '/manager', end: true },
  { label: 'Leadership', to: '/assessment/leadership' },
  { label: 'Skills',     to: '/assessment/skills' },
  { label: 'Culture',    to: '/assessment/cvf' },
  { label: 'Roles',      to: '/roles' },
  { label: 'Reteaming',  to: '/reteaming' },
]

const COMPANY_NAV: NavItem[] = [
  { label: 'Dashboard',   to: '/company', end: true },
  { label: 'Culture',     to: '/company-profile' },
  { label: 'People',      to: '/people' },
  { label: 'Roles',       to: '/roles' },
  { label: 'Reteaming',   to: '/reteaming' },
]

const HIDDEN_PATHS = new Set(['/', '/seed'])

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { currentUserId, currentRole, logout } = useStore()

  if (HIDDEN_PATHS.has(pathname) || !currentUserId || !currentRole) return null

  const nav =
    currentRole === 'member'  ? MEMBER_NAV  :
    currentRole === 'manager' ? MANAGER_NAV :
    COMPANY_NAV

  const roleColor =
    currentRole === 'member'  ? 'bg-blue-600'   :
    currentRole === 'manager' ? 'bg-orange-600' :
    'bg-purple-600'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      {/* Brand */}
      <span className={`shrink-0 text-xs font-bold uppercase tracking-widest text-white px-2.5 py-1 rounded-md ${roleColor}`}>
        {currentRole === 'member' ? 'Member' : currentRole === 'manager' ? 'Manager' : 'Company'}
      </span>

      {/* Nav links */}
      <nav className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 scrollbar-hide">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            {...(item.end ? { end: true } : {})}
            className={({ isActive }) =>
              `shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="shrink-0 flex items-center gap-3">
        <span className="text-xs text-gray-400 hidden sm:block truncate max-w-32">{currentUserId}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
