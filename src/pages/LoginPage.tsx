import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email address is required')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate('/timeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedLogin = async () => {
    setEmail('anuj@probsol.dev')
    setPassword('Password123!')
    setIsLoading(true)
    setError('')
    try {
      await login('anuj@probsol.dev', 'Password123!')
      navigate('/timeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
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
              className="secondary-action"
              onClick={async () => {
                await logout()
              }}
            >
              Sign Out / Switch User
            </button>
          </div>
        </div>
      ) : null}

      {/* 1-Click Authentication Card for Reviewers / Seed Testing */}
      <div className="demo-accounts-card">
        <p className="demo-card-title">⚡ Quick Seed Account</p>
        <p className="demo-card-subtitle">
          1-Click sign in with the live backend seed account:
        </p>
        <div className="demo-user-buttons">
          <button
            type="button"
            className="demo-user-btn"
            onClick={handleSeedLogin}
            disabled={isLoading}
          >
            <span className="demo-avatar">A</span>
            <span className="demo-details">
              <strong>Anuj Tiwari (Seed Account)</strong>
              <small>anuj@probsol.dev • Password123!</small>
            </span>
          </button>
        </div>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error ? (
            <p className="submit-message is-error" role="alert">
              {error}
            </p>
          ) : null}

          <label className="field-group">
            <span className="field-label">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              disabled={isLoading}
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </label>

          <button type="submit" className="primary-action auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
