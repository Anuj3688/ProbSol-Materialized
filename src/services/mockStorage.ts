import type {
  CaptureDraft,
  EntryFilterParams,
  EntryStatus,
  TagSummary,
  TimelineEntry,
  User,
} from '../types'

const USERS_KEY = 'probsol_mock_users_v1'
const ENTRIES_KEY = 'probsol_mock_entries_v1'
const ACTIVE_USER_KEY = 'probsol_active_user_id_v1'

const SEED_USERS: User[] = [
  {
    id: 'usr_anuj',
    email: 'anuj@probsol.dev',
    displayName: 'Anuj Tiwari',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'usr_sarah',
    email: 'sarah@probsol.dev',
    displayName: 'Sarah Chen',
    createdAt: '2026-06-05T14:30:00.000Z',
  },
]

const SEED_ENTRIES: TimelineEntry[] = [
  {
    id: 'entry_anuj_1',
    userId: 'usr_anuj',
    type: 'problem',
    status: 'OPEN',
    title: 'Need a better retry architecture for RabbitMQ consumers',
    description:
      'Message reprocessing causes duplicate side effects on high consumer lag. Need to evaluate dead-letter exchanges vs delayed message plugin.',
    tags: ['backend', 'rabbitmq', 'architecture'],
    createdAt: '2026-06-20T18:30:00.000Z',
  },
  {
    id: 'entry_anuj_2',
    userId: 'usr_anuj',
    type: 'solution',
    status: 'SOLVED',
    title: 'Use delayed exchanges instead of immediate consumer retries',
    description:
      'Configured rabbitmq-delayed-message-exchange with exponential backoff routing keys and a 5-attempt dead letter queue limit.',
    tags: ['backend', 'rabbitmq'],
    createdAt: '2026-06-21T09:15:00.000Z',
  },
  {
    id: 'entry_anuj_3',
    userId: 'usr_anuj',
    type: 'problem',
    status: 'OPEN',
    title: 'Understand Redis eviction strategies under heavy memory load',
    description:
      'Need to benchmark volatile-lru versus allkeys-lfu when caching ephemeral auth tokens and rate-limiting counters.',
    tags: ['database', 'redis', 'caching'],
    createdAt: '2026-06-21T14:20:00.000Z',
  },
  {
    id: 'entry_anuj_4',
    userId: 'usr_anuj',
    type: 'problem',
    status: 'OPEN',
    title: 'Improve swimming bilateral breathing rhythm',
    description:
      'Breathing only to the right side causes shoulder fatigue after 1km. Need 3-stroke alternate breathing rhythm.',
    tags: ['personal', 'swimming', 'health'],
    createdAt: '2026-06-22T07:45:00.000Z',
  },
  {
    id: 'entry_anuj_5',
    userId: 'usr_anuj',
    type: 'solution',
    status: 'SOLVED',
    title: 'Bilateral drill progression for stroke consistency',
    description:
      'Practicing 3-3-3 pull buoy drills twice weekly to balance neck rotation and eliminate unilateral breathing strain.',
    tags: ['personal', 'swimming'],
    createdAt: '2026-06-22T08:30:00.000Z',
  },
  // Sarah Chen's entries (multi-user testing)
  {
    id: 'entry_sarah_1',
    userId: 'usr_sarah',
    type: 'problem',
    status: 'OPEN',
    title: 'Optimize Largest Contentful Paint (LCP) on mobile landing',
    description:
      'Hero banner image triggers 3.8s LCP on 4G networks due to unoptimized PNG assets and missing preloads.',
    tags: ['frontend', 'performance', 'web'],
    createdAt: '2026-06-21T11:00:00.000Z',
  },
  {
    id: 'entry_sarah_2',
    userId: 'usr_sarah',
    type: 'solution',
    status: 'SOLVED',
    title: 'Serve modern AVIF/WebP pictures with high fetch priority',
    description:
      'Added fetchpriority="high" and responsive picture element with WebP fallbacks, dropping LCP to 1.1s.',
    tags: ['frontend', 'performance'],
    createdAt: '2026-06-21T16:00:00.000Z',
  },
  {
    id: 'entry_sarah_3',
    userId: 'usr_sarah',
    type: 'problem',
    status: 'OPEN',
    title: 'Design token drift between Figma variables and CSS tokens',
    description:
      'Typography hierarchy and corner radii are diverging across web and native mobile apps.',
    tags: ['design', 'ui', 'tokens'],
    createdAt: '2026-06-22T13:10:00.000Z',
  },
]

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
      return SEED_USERS
    }
    return JSON.parse(raw) as User[]
  } catch {
    return SEED_USERS
  }
}

function setStoredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getStoredEntries(): TimelineEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(SEED_ENTRIES))
      return SEED_ENTRIES
    }
    return JSON.parse(raw) as TimelineEntry[]
  } catch {
    return SEED_ENTRIES
  }
}

function setStoredEntries(entries: TimelineEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function getActiveMockUserId(): string {
  const current = localStorage.getItem(ACTIVE_USER_KEY)
  if (current) return current
  const defaultUser = getStoredUsers()[0]?.id || 'usr_anuj'
  localStorage.setItem(ACTIVE_USER_KEY, defaultUser)
  return defaultUser
}

export function setActiveMockUserId(userId: string) {
  localStorage.setItem(ACTIVE_USER_KEY, userId)
}

export const mockBackend = {
  getDemoUsers(): User[] {
    return getStoredUsers()
  },

  getCurrentUser(): User | null {
    const activeId = getActiveMockUserId()
    const users = getStoredUsers()
    return users.find((user) => user.id === activeId) || users[0] || null
  },

  login(email: string): User {
    const users = getStoredUsers()
    const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase().trim())
    if (existing) {
      setActiveMockUserId(existing.id)
      return existing
    }
    // Auto-create user for frictionless testing
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      displayName: email.split('@')[0],
      createdAt: new Date().toISOString(),
    }
    const nextUsers = [...users, newUser]
    setStoredUsers(nextUsers)
    setActiveMockUserId(newUser.id)
    return newUser
  },

  register(email: string, displayName: string): User {
    const users = getStoredUsers()
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
    if (existing) {
      setActiveMockUserId(existing.id)
      return existing
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      displayName: displayName.trim() || email.split('@')[0],
      createdAt: new Date().toISOString(),
    }
    setStoredUsers([...users, newUser])
    setActiveMockUserId(newUser.id)
    return newUser
  },

  switchUser(userId: string): User | null {
    const users = getStoredUsers()
    const found = users.find((u) => u.id === userId)
    if (found) {
      setActiveMockUserId(found.id)
      return found
    }
    return null
  },

  listEntries(params: EntryFilterParams = {}): TimelineEntry[] {
    const currentUserId = getActiveMockUserId()
    let list = getStoredEntries().filter((e) => e.userId === currentUserId)

    // Search query filter (title + description)
    if (params.q && params.q.trim()) {
      const q = params.q.toLowerCase().trim()
      list = list.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(q)
        const descMatch = (e.description || '').toLowerCase().includes(q)
        const tagMatch = (e.tags || []).some((t) => t.toLowerCase().includes(q))
        return titleMatch || descMatch || tagMatch
      })
    }

    // Type filter
    if (params.type && params.type !== 'all') {
      list = list.filter((e) => e.type === params.type)
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      list = list.filter((e) => e.status === params.status)
    }

    // Tag filter
    if (params.tag && params.tag.trim()) {
      const tagLower = params.tag.toLowerCase().trim()
      list = list.filter((e) => (e.tags || []).some((t) => t.toLowerCase() === tagLower))
    }

    // Sorting
    const sort = params.sortBy || 'newest'
    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }

    return list
  },

  createEntry(draft: CaptureDraft): TimelineEntry {
    const currentUserId = getActiveMockUserId()
    const entries = getStoredEntries()
    const newEntry: TimelineEntry = {
      ...draft,
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    }
    setStoredEntries([newEntry, ...entries])
    return newEntry
  },

  updateEntry(id: string, updates: Partial<CaptureDraft>): TimelineEntry {
    const entries = getStoredEntries()
    const index = entries.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error('Entry not found')
    }
    const updated: TimelineEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    entries[index] = updated
    setStoredEntries([...entries])
    return updated
  },

  updateEntryStatus(id: string, status: EntryStatus): TimelineEntry {
    return this.updateEntry(id, { status })
  },

  deleteEntry(id: string): boolean {
    const entries = getStoredEntries()
    const filtered = entries.filter((e) => e.id !== id)
    if (filtered.length === entries.length) return false
    setStoredEntries(filtered)
    return true
  },

  listTags(): TagSummary[] {
    const currentUserId = getActiveMockUserId()
    const userEntries = getStoredEntries().filter((e) => e.userId === currentUserId)
    const countMap: Record<string, number> = {}

    userEntries.forEach((entry) => {
      ;(entry.tags || []).forEach((tag) => {
        const clean = tag.trim().toLowerCase()
        if (clean) {
          countMap[clean] = (countMap[clean] || 0) + 1
        }
      })
    })

    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  },
}
