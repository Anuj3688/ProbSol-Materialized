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
import { mockBackend } from '../services/mockStorage'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [demoUsers, setDemoUsers] = useState<User[]>([])

  const loadProfile = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setDemoUsers(mockBackend.getDemoUsers())
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
          setDemoUsers(mockBackend.getDemoUsers())
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

  const login = useCallback(
    async (email: string, password?: string) => {
      setIsLoading(true)
      try {
        const loggedIn = await loginUser(email, password)
        setUser(loggedIn)
        setDemoUsers(mockBackend.getDemoUsers())
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
        setDemoUsers(mockBackend.getDemoUsers())
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

  const switchUser = useCallback((userId: string) => {
    const switched = mockBackend.switchUser(userId)
    if (switched) {
      setUser(switched)
    }
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
      demoUsers,
      refreshProfile: loadProfile,
    }),
    [user, isLoading, login, register, logout, switchUser, demoUsers, loadProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
