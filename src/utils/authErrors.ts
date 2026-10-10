export interface AuthErrorInfo {
  title: string
  description: string
  isCredentialsError?: boolean
}

/**
 * Normalizes and categorizes raw error strings or exceptions from authentication calls
 * into human-friendly, actionable feedback.
 */
export function classifyAuthError(err: unknown): AuthErrorInfo {
  const rawMessage = err instanceof Error ? err.message : String(err || 'Authentication failed')
  const lower = rawMessage.toLowerCase()

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
    title: 'Sign In Failed',
    description: rawMessage,
  }
}
