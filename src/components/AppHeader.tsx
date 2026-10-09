import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ThemeMode } from '../types'
import { useAuth } from '../hooks/useAuth'

type AppHeaderProps = {
  themeMode: ThemeMode
  onThemeModeChange: (themeMode: ThemeMode) => void
}

export function AppHeader({ themeMode, onThemeModeChange }: AppHeaderProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
    navigate('/login')
  }

  const handleLogoClick = async () => {
    setShowUserMenu(false)
    if (isAuthenticated) {
      await logout()
    }
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Left: Brand Identity (Clicking logo directly logs out and moves to login) */}
        <div className="header-brand-group">
          <button
            type="button"
            className="brand-link"
            onClick={handleLogoClick}
            aria-label="ProbSol Materialised - Sign out and return to login"
            title="Click to sign out and return to login"
          >
            <div className="brand-badge-icon" aria-hidden="true">
              <span>⚡</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">ProbSol</span>
              <span className="brand-tagline">Materialised</span>
            </div>
          </button>
        </div>

        {/* Center: Primary Navigation (Capture & Timeline) */}
        <nav className="header-nav-tabs" aria-label="Primary Navigation">
          <NavLink
            to="/capture"
            className={({ isActive }) => `header-nav-tab ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-tab-icon" aria-hidden="true">＋</span>
            <span className="nav-tab-text">Capture</span>
          </NavLink>
          <NavLink
            to="/timeline"
            className={({ isActive }) => `header-nav-tab ${isActive ? 'is-active' : ''}`}
          >
            <span className="nav-tab-icon" aria-hidden="true">☰</span>
            <span className="nav-tab-text">Timeline</span>
          </NavLink>
        </nav>

        {/* Right: Controls (Live API Status, Theme, Auth) */}
        <div className="header-controls">
          {/* Live API Status Badge (Permanent Live REST API) */}
          <div
            className="backend-mode-badge is-api"
            title="Connected to ProbSol Live REST API"
          >
            <span className="mode-dot" aria-hidden="true" />
            <span className="mode-text">Live API</span>
          </div>

          {/* Theme Switcher */}
          <div className="theme-switch-pill" role="radiogroup" aria-label="Theme selector">
            <button
              type="button"
              className={`theme-switch-option ${themeMode === 'light' ? 'is-active' : ''}`}
              onClick={() => onThemeModeChange('light')}
              title="Light Mode"
              aria-label="Switch to light mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>Light</span>
            </button>
            <button
              type="button"
              className={`theme-switch-option ${themeMode === 'dark' ? 'is-active' : ''}`}
              onClick={() => onThemeModeChange('dark')}
              title="Dark Mode"
              aria-label="Switch to dark mode"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark</span>
            </button>
          </div>

          {/* User Profile / Auth Actions */}
          {isAuthenticated && user ? (
            <div className="user-profile-menu-wrapper">
              <button
                type="button"
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-label={`User menu for ${user.displayName}`}
              >
                <span className="user-initial">{user.displayName.charAt(0).toUpperCase()}</span>
                <span className="user-display-name">{user.displayName.split(' ')[0]}</span>
                <span className="user-caret" aria-hidden="true">▾</span>
              </button>

              {showUserMenu ? (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <p className="dropdown-user-name">{user.displayName}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>

                  <div className="dropdown-actions">
                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className="header-signin-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
