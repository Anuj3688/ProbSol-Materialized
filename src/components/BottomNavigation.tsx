import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function BottomNavigation() {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <NavLink
        to="/capture"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'is-active' : ''}`}
      >
        <span className="tab-icon-wrapper" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        <span className="tab-label">Capture</span>
      </NavLink>

      <NavLink
        to="/timeline"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'is-active' : ''}`}
      >
        <span className="tab-icon-wrapper" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </span>
        <span className="tab-label">Timeline</span>
      </NavLink>

      <NavLink
        to="/login"
        className={({ isActive }) => `bottom-nav-tab ${isActive ? 'is-active' : ''}`}
      >
        <span className="tab-icon-wrapper" aria-hidden="true">
          {isAuthenticated && user ? (
            <span className="dock-avatar">{user.displayName.charAt(0).toUpperCase()}</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </span>
        <span className="tab-label">{isAuthenticated && user ? user.displayName.split(' ')[0] : 'Account'}</span>
      </NavLink>
    </nav>
  )
}
