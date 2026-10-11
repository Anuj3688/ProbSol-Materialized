export interface AuthErrorInfo {
  title: string
  description: string
  isCredentialsError?: boolean
  isAlreadyRegistered?: boolean
}

/**
 * Normalizes and categorizes raw error strings or exceptions from authentication calls
 * (login, registration, password reset) into human-friendly, actionable feedback.
 */
export function classifyAuthError(err: unknown): AuthErrorInfo {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Authentication failed')
  const lower = rawMessage.toLowerCase()

  // 1. Duplicate email during registration
  if (lower.includes('already registered') || lower.includes('already in use') || lower.includes('already exists')) {
    return {
      title: 'Email Already Registered',
      description: 'An account with this email address already exists. Please sign in instead.',
      isAlreadyRegistered: true,
    }
  }

  // 2. Validation constraints
  if (lower.includes('password must be')) {
    return {
      title: 'Password Requirement',
      description: 'Your password must be at least 6 characters long.',
    }
  }

  if (lower.includes('email must be valid') || lower.includes('invalid email address')) {
    return {
      title: 'Invalid Email Address',
      description: 'Please enter a valid email format (e.g. you@example.com).',
    }
  }

  // 3. Database lock / SQLite concurrency
  if (lower.includes('database is locked') || lower.includes('sqlite_busy') || lower.includes('database locked')) {
    return {
      title: 'Database Busy',
      description: 'The server database was momentarily busy processing another request. Please try submitting again in a few moments.',
    }
  }

  // 4. Bad credentials on sign-in
  const isBadCreds =
    lower.includes('invalid email or password') ||
    lower.includes('bad credentials') ||
    lower.includes('unauthorized') ||
    lower.includes('invalid credentials') ||
    lower.includes('401')

  if (isBadCreds) {
    return {
      title: 'Incorrect Email or Password',
      description:
        'The email or password you entered does not match our records. Please verify your details, or create a new workspace if you haven’t registered yet.',
      isCredentialsError: true,
    }
  }

  // 5. Network / offline issues
  const isNetworkIssue =
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('failed to fetch') ||
    lower.includes('abort') ||
    lower.includes('offline')

  if (isNetworkIssue) {
    return {
      title: 'Connection Issue',
      description:
        'Unable to communicate with the authentication service. Please check your internet connection and try again.',
    }
  }

  // 6. Upstream server / Gateway errors
  const isServerError =
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504') ||
    lower.includes('bad gateway') ||
    lower.includes('service unavailable')

  if (isServerError) {
    return {
      title: 'Server Temporarily Unavailable',
      description:
        'The authentication server is currently waking up or unavailable. Please wait a moment and try again.',
    }
  }

  return {
    title: 'Action Failed',
    description: rawMessage,
  }
}
