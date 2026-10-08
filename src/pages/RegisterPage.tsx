import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState('')
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
    if (!displayName.trim()) {
      setError('Name is required')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      await register(email.trim(), displayName.trim(), password)
      navigate('/timeline')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-stack auth-page" aria-labelledby="register-title">
      <div className="section-heading">
        <p className="eyebrow">Get Started</p>
        <h2 id="register-title">Create your workspace</h2>
        <p>Set up your private thought vault to track engineering problems and breakthroughs.</p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error ? (
            <p className="submit-message is-error" role="alert">
              {error}
            </p>
          ) : null}

          <label className="field-group">
            <span className="field-label">Your name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setError('')
              }}
              placeholder="e.g. Alex Morgan"
              disabled={isLoading}
              required
            />
          </label>

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
              placeholder="Create a password"
              disabled={isLoading}
            />
          </label>

          <button type="submit" className="primary-action auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
