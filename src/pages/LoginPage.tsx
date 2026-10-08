import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getBackendMode } from '../services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, demoUsers, switchUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isApiMode = getBackendMode() === 'api'

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

  const handleDemoLogin = (userId: string) => {
    switchUser(userId)
    navigate('/timeline')
  }

  return (
    <section className="page-stack auth-page" aria-labelledby="login-title">
      <div className="section-heading">
        <p className="eyebrow">ProbSol Account</p>
        <h2 id="login-title">Sign in to your repository</h2>
        <p>Keep your problems, solutions, and engineering thoughts private and organized.</p>
      </div>

      {/* 1-Click Authentication Card */}
      {isApiMode ? (
        <div className="demo-accounts-card">
          <p className="demo-card-title">⚡ Backend Seed Account</p>
          <p className="demo-card-subtitle">
            1-Click authenticate with the active Render backend seed account:
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
                <strong>Anuj Tiwari</strong>
                <small>anuj@probsol.dev • Password123!</small>
              </span>
            </button>
          </div>
        </div>
      ) : demoUsers.length > 0 ? (
        <div className="demo-accounts-card">
          <p className="demo-card-title">⚡ Quick 1-Click Multi-User Demo</p>
          <p className="demo-card-subtitle">
            Test multi-user isolation instantly without typing passwords:
          </p>
          <div className="demo-user-buttons">
            {demoUsers.map((demo) => (
              <button
                key={demo.id}
                type="button"
                className="demo-user-btn"
                onClick={() => handleDemoLogin(demo.id)}
              >
                <span className="demo-avatar">{demo.displayName.charAt(0)}</span>
                <span className="demo-details">
                  <strong>{demo.displayName}</strong>
                  <small>{demo.email}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
