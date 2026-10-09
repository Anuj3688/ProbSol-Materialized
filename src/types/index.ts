export type AppPage = 'capture' | 'timeline' | 'login' | 'register'

export type ThemeMode = 'system' | 'light' | 'dark'

export type BackendMode = 'mock' | 'api'

export type CaptureType = 'problem' | 'solution'

export type EntryStatus = 'OPEN' | 'SOLVED'

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface AuthSession {
  user: User
  accessToken: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export type CaptureDraft = {
  type: CaptureType
  status: EntryStatus
  title: string
  description: string
  tags: string[]
}

export type TimelineEntry = CaptureDraft & {
  id: string
  userId?: string
  createdAt: string
  updatedAt?: string
}

export interface EntryFilterParams {
  q?: string
  type?: 'all' | 'problem' | 'solution'
  status?: 'all' | 'OPEN' | 'SOLVED'
  tag?: string
  sortBy?: 'newest' | 'oldest' | 'title'
}

export interface TagSummary {
  name: string
  count: number
}

export type ProblemPriority = 'low' | 'medium' | 'high'

export type ProblemStatus = 'open' | 'solved' | 'archived'

export type ProblemEntry = {
  id: string
  title: string
  context: string
  priority: ProblemPriority
  status: ProblemStatus
  createdAt: string
}
