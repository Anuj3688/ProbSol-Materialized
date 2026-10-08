import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ThemeMode } from '../types'
import { useAuth } from '../hooks/useAuth'
import { getBackendMode, setBackendMode } from '../services/api'

type AppHeaderProps = {
  themeMode: ThemeMode
  onThemeModeChange: (themeMode: ThemeMode) => void
}

export function AppHeader({ themeMode, onThemeModeChange }: AppHeaderProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, demoUsers, switchUser } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const currentMode = getBackendMode()

  const handleLogout = async () => {
    setShowUserMenu(false)
    await logout()
    navigate('/login')
  }

  const handleToggleMode = () => {
    const nextMode = currentMode === 'mock' ? 'api' : 'mock'
    setBackendMode(nextMode)
    window.location.reload()
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Left: Brand Identity in a single compact row */}
        <div className="header-brand-group">
          <Link to="/timeline" className="brand-link" aria-label="ProbSol Materialised Home">
            <div className="brand-badge-icon" aria-hidden="true">
              <span>⚡</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">ProbSol</span>
              <span className="brand-tagline">Materialised</span>
            </div>
          </Link>
        </div>

        {/* Center: Single-line Primary Navigation (Capture & Timeline) */}
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

        {/* Right: Controls in a single horizontal line */}
        <div className="header-controls">
          {/* Backend Mode Indicator Badge */}
          <button
            type="button"
            className={`backend-mode-badge ${currentMode === 'mock' ? 'is-mock' : 'is-api'}`}
            onClick={handleToggleMode}
            title={`Toggle Backend: Click to switch between Mock Vault and Live REST API. Current: ${currentMode.toUpperCase()}`}
          >
            <span className="mode-dot" aria-hidden="true" />
            <span className="mode-text">
              {currentMode === 'mock' ? 'Mock Vault' : 'Live API'}
            </span>
          </button>

          {/* Clean Segmented Theme Switcher */}
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

                  {demoUsers.length > 1 ? (
                    <div className="dropdown-switch-section">
                      <span className="dropdown-section-title">Switch Workspace:</span>
                      {demoUsers.map((demo) => (
                        <button
                          key={demo.id}
                          type="button"
                          className={`switch-user-item ${demo.id === user.id ? 'is-active' : ''}`}
                          onClick={() => {
                            switchUser(demo.id)
                            setShowUserMenu(false)
                          }}
                        >
                          <span className="mini-avatar">{demo.displayName.charAt(0)}</span>
                          <span className="switch-user-name">{demo.displayName}</span>
                          {demo.id === user.id ? <span className="active-check">✓</span> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}

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
