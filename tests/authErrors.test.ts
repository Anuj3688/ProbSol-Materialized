import { describe, it, expect } from 'vitest'
import { classifyAuthError } from '../src/utils/authErrors'

describe('Authentication Error Classification (classifyAuthError)', () => {
  it('correctly classifies 401 Bad Credentials into a helpful, friendly message', () => {
    const errorCases = [
      new Error('Bad credentials'),
      new Error('Invalid email or password'),
      new Error('Request failed with status 401'),
      new Error('Unauthorized access'),
      new Error('INVALID CREDENTIALS'),
    ]

    for (const err of errorCases) {
      const result = classifyAuthError(err)
      expect(result.title).toBe('Incorrect Email or Password')
      expect(result.isCredentialsError).toBe(true)
      expect(result.description).toContain('does not match our records')
    }
  })

  it('correctly classifies duplicate email registration errors', () => {
    const errorCases = [
      new Error('Email is already registered'),
      new Error('User with this email already exists'),
      new Error('Email already in use'),
    ]

    for (const err of errorCases) {
      const result = classifyAuthError(err)
      expect(result.title).toBe('Email Already Registered')
      expect(result.isAlreadyRegistered).toBe(true)
      expect(result.description).toContain('Please sign in instead')
    }
  })

  it('correctly classifies registration password and email validation errors', () => {
    const pwdResult = classifyAuthError(new Error('Password must be between 6 and 100 characters'))
    expect(pwdResult.title).toBe('Password Requirement')
    expect(pwdResult.description).toContain('at least 6 characters')

    const emailResult = classifyAuthError(new Error('Email must be valid'))
    expect(emailResult.title).toBe('Invalid Email Address')
    expect(emailResult.description).toContain('valid email format')
  })

  it('correctly classifies database lock and concurrency issues', () => {
    const result = classifyAuthError(new Error('[SQLITE_BUSY] The database file is locked (database is locked)'))
    expect(result.title).toBe('Database Busy')
    expect(result.description).toContain('momentarily busy processing another request')
  })

  it('correctly classifies network and offline connection issues', () => {
    const errorCases = [
      new Error('Failed to fetch'),
      new Error('NetworkError when attempting to fetch resource'),
      new Error('fetch failed'),
      new Error('The network connection was lost'),
    ]

    for (const err of errorCases) {
      const result = classifyAuthError(err)
      expect(result.title).toBe('Connection Issue')
      expect(result.description).toContain('Unable to communicate with the authentication service')
      expect(result.isCredentialsError).toBeFalsy()
    }
  })

  it('correctly classifies upstream server errors (500, 502, 503)', () => {
    const errorCases = [
      new Error('Request failed with status 500'),
      new Error('502 Bad Gateway'),
      new Error('503 Service Unavailable'),
    ]

    for (const err of errorCases) {
      const result = classifyAuthError(err)
      expect(result.title).toBe('Server Temporarily Unavailable')
      expect(result.description).toContain('currently waking up or unavailable')
    }
  })

  it('preserves specific custom backend error messages if not matching standard codes', () => {
    const result = classifyAuthError(new Error('User account is temporarily locked'))
    expect(result.title).toBe('Action Failed')
    expect(result.description).toBe('User account is temporarily locked')
  })

  it('gracefully handles non-Error objects (e.g., strings)', () => {
    const result = classifyAuthError('Bad credentials')
    expect(result.title).toBe('Incorrect Email or Password')
    expect(result.isCredentialsError).toBe(true)
  })
})
