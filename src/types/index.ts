export type AppPage = 'capture' | 'timeline'

export type ThemeMode = 'system' | 'light' | 'dark'

export type CaptureType = 'problem' | 'solution'

export type EntryStatus = 'OPEN' | 'SOLVED'

export type CaptureDraft = {
  type: CaptureType
  status: EntryStatus
  title: string
  description: string
  tags: string[]
}

export type TimelineEntry = CaptureDraft & {
  id: string
  createdAt: string
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
