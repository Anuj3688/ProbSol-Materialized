import { useState, useEffect, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { classifyAuthError, type AuthErrorInfo } from '../utils/authErrors'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, login } = useAuth()

  const stateEmail = (location.state as { email?: string } | null)?.email || ''
  const queryEmail = new URLSearchParams(location.search).get('email') || ''
  const [email, setEmail] = useState(stateEmail || queryEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showColdBootNotice, setShowColdBootNotice] = useState(false)

  // Track cold-boot duration to reassure waiting users
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => {
      setShowColdBootNotice(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [isLoading])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    if (!email.trim()) {
      setAuthError({
        title: 'Email Address Required',
        description: 'Please enter your registered email address to sign in.',
      })
      return
    }

    if (!password) {
      setAuthError({
        title: 'Password Required',
        description: 'Please enter your account password.',
      })
      return
    }

    setIsLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/timeline')
    } catch (err) {
      setAuthError(classifyAuthError(err))
    } finally {
      setIsLoading(false)
      setShowColdBootNotice(false)
    }
  }

  return (
    <section className="page-stack auth-page" aria-labelledby="login-title">
      <div className="section-heading">
        <p className="eyebrow">ProbSol Account</p>
        <h2 id="login-title">Sign in to your repository</h2>
        <p>Keep your problems, solutions, and engineering thoughts private and organized.</p>
      </div>

      {/* Active Session Notice if already signed in */}
      {isAuthenticated && user ? (
        <div className="demo-accounts-card" style={{ borderColor: 'var(--accent, #4f46e5)' }}>
          <p className="demo-card-title">👤 Active Session</p>
          <p className="demo-card-subtitle">
            Currently authenticated as <strong>{user.displayName}</strong> ({user.email}).
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="primary-action"
              onClick={() => navigate('/timeline')}
            >
              Continue to Timeline →
            </button>
            <button
              type="button"
              className="ghost-action"
              onClick={async () => {
                await logout()
                setAuthError(null)
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {authError ? (
            <div className="auth-alert-banner" role="alert">
              <div className="alert-icon-zone" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="alert-text-zone">
                <h4 className="alert-title">{authError.title}</h4>
                <p className="alert-description">{authError.description}</p>
                {authError.isCredentialsError ? (
                  <p className="alert-action-hint">
                    Don&apos;t have an account yet?{' '}
                    <Link to="/register" className="alert-register-link">
                      Create one here →
                    </Link>
                  </p>
                ) : null}
                {!authError.isCredentialsError && (
                  <button
                    type="button"
                    className="alert-retry-btn"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    ↻ Try Again
                  </button>
                )}
              </div>
            </div>
          ) : null}

          <label className="field-group">
            <span className="field-label">Email address</span>
            <input
              type="email"
              className={authError?.isCredentialsError ? 'input-error' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setAuthError(null)
              }}
              placeholder="you@example.com"
              disabled={isLoading}
              required
              autoComplete="username"
            />
          </label>

          <label className="field-group">
            <div className="field-label-row">
              <span className="field-label">Password</span>
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={authError?.isCredentialsError ? 'input-error' : ''}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setAuthError(null)
                }}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </label>

          <button type="submit" className="primary-action auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {showColdBootNotice ? (
            <div className="auth-coldboot-notice" role="status">
              <div className="coldboot-spinner" aria-hidden="true" />
              <div>
                <strong>Waking cloud server…</strong>
                <p style={{ margin: '3px 0 0', opacity: 0.88, fontSize: '0.78rem' }}>
                  Cloud database wakes up automatically from sleep. This takes a few seconds on the first visit — please hold tight!
                </p>
              </div>
            </div>
          ) : null}
        </form>

        <div className="auth-footer-links">
          <p>
            Need a fresh workspace? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
