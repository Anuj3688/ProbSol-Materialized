import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { classifyAuthError, type AuthErrorInfo } from '../utils/authErrors'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setAuthError({
        title: 'Name Required',
        description: 'Please enter your name or preferred display name.',
      })
      return
    }

    if (!trimmedEmail) {
      setAuthError({
        title: 'Email Address Required',
        description: 'Please provide a valid email address to create your account.',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError({
        title: 'Invalid Email Address',
        description: 'Please enter a valid email format (e.g. name@example.com).',
      })
      return
    }

    if (!password) {
      setAuthError({
        title: 'Password Required',
        description: 'Please choose a password with at least 6 characters.',
      })
      return
    }

    if (password.length < 6) {
      setAuthError({
        title: 'Password Too Short',
        description: 'Your password must be at least 6 characters long.',
      })
      return
    }

    setIsLoading(true)
    try {
      await register(trimmedEmail, trimmedName, password)
      navigate('/timeline')
    } catch (err) {
      setAuthError(classifyAuthError(err))
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
                {authError.isAlreadyRegistered ? (
                  <p className="alert-action-hint">
                    Already have an account?{' '}
                    <Link to="/login" className="alert-register-link">
                      Sign in here →
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <label className="field-group">
            <span className="field-label">Your name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setAuthError(null)
              }}
              placeholder="e.g. Alex Morgan"
              disabled={isLoading}
              required
              autoComplete="name"
            />
          </label>

          <label className="field-group">
            <span className="field-label">Email address</span>
            <input
              type="email"
              className={authError?.isAlreadyRegistered ? 'input-error' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setAuthError(null)
              }}
              placeholder="you@example.com"
              disabled={isLoading}
              required
              autoComplete="email"
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setAuthError(null)
                }}
                placeholder="At least 6 characters"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </label>

          <button type="submit" className="primary-action auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating workspace...' : 'Create workspace'}
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
