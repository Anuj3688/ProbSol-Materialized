import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/api'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to load user profile:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    getCurrentUser()
      .then((currentUser) => {
        if (!ignore) {
          setUser(currentUser)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setUser(null)
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      setUser(null)
      setIsLoading(false)
    }
    window.addEventListener('probsol:auth-expired', handleExpired)
    return () => {
      window.removeEventListener('probsol:auth-expired', handleExpired)
    }
  }, [])

  const login = useCallback(
    async (email: string, password?: string) => {
      setIsLoading(true)
      try {
        const loggedIn = await loginUser(email, password)
        setUser(loggedIn)
        return loggedIn
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const register = useCallback(
    async (email: string, displayName: string, password?: string) => {
      setIsLoading(true)
      try {
        const registered = await registerUser(email, displayName, password)
        setUser(registered)
        return registered
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchUser = useCallback(() => {
    // No-op in live API mode
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      switchUser,
      demoUsers: [],
      refreshProfile: loadProfile,
    }),
    [user, isLoading, login, register, logout, switchUser, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
