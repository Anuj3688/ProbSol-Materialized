import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password?: string) => Promise<User>
  register: (email: string, displayName: string, password?: string) => Promise<User>
  logout: () => Promise<void>
  switchUser: (userId: string) => void
  demoUsers: User[]
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
