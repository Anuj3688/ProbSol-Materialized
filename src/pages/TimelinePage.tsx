import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CaptureDraft, EntryFilterParams, EntryStatus, TagSummary, TimelineEntry } from '../types'
import { deleteEntry, getEntries, getTags, updateEntry, updateEntryStatus } from '../services/api'
import { SearchFilterBar } from '../components/SearchFilterBar'
import { EditEntryModal } from '../components/EditEntryModal'
import { useAuth } from '../hooks/useAuth'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function TimelinePage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [tags, setTags] = useState<TagSummary[]>([])
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null)

  // Search & Filter State
  const [filter, setFilter] = useState<EntryFilterParams>({
    q: '',
    type: 'all',
    status: 'all',
    tag: undefined,
    sortBy: 'newest',
  })

  const isLoading = status === 'loading'

  const loadData = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const [fetchedEntries, fetchedTags] = await Promise.all([
        getEntries(filter),
        getTags(),
      ])
      setEntries(fetchedEntries)
      setTags(fetchedTags)
      setStatus('loaded')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load entries.')
      setStatus('error')
    }
  }, [filter])

  useEffect(() => {
    let ignore = false
    Promise.all([getEntries(filter), getTags()])
      .then(([fetchedEntries, fetchedTags]) => {
        if (!ignore) {
          setEntries(fetchedEntries)
          setTags(fetchedTags)
          setStatus('loaded')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load entries.')
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [filter, user?.id])

  const handleStatusToggle = useCallback(
    async (entryId: string, currentStatus: EntryStatus) => {
      const newStatus: EntryStatus = currentStatus === 'OPEN' ? 'SOLVED' : 'OPEN'
      setUpdatingId(entryId)

      try {
        const updatedEntry = await updateEntryStatus(entryId, newStatus)
        setEntries((prevEntries) =>
          prevEntries.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
        )
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update status'
        console.error('Status update failed:', errorMsg)
        setErrorMessage(errorMsg)
      } finally {
        setUpdatingId(null)
      }
    },
    [],
  )

  const handleEditSave = useCallback(
    async (id: string, updates: Partial<CaptureDraft>) => {
      const updated = await updateEntry(id, updates)
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
      const nextTags = await getTags()
      setTags(nextTags)
    },
    [],
  )

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      const confirmed = window.confirm(`Delete "${title}"?`)
      if (!confirmed) return

      try {
        await deleteEntry(id)
        setEntries((prev) => prev.filter((e) => e.id !== id))
        const nextTags = await getTags()
        setTags(nextTags)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete note')
      }
    },
    [],
  )

  const handleTagClick = useCallback((clickedTag: string) => {
    setFilter((prev) => ({
      ...prev,
      tag: prev.tag?.toLowerCase() === clickedTag.toLowerCase() ? undefined : clickedTag,
    }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilter({
      q: '',
      type: 'all',
      status: 'all',
      tag: undefined,
      sortBy: 'newest',
    })
  }, [])

  const totalEntriesCount = useMemo(() => {
    return entries.length
  }, [entries])

  return (
    <section className="page-stack timeline-page" aria-labelledby="timeline-title">
      <div className="timeline-topbar">
        <div className="section-heading">
          <div className="section-pill-tag">
            <span className="pill-dot" />
            <span>{user ? `${user.displayName}'s Vault` : 'Knowledge Feed'}</span>
          </div>
          <h2 id="timeline-title">Recent Captures</h2>
          <p className="section-description">
            Your live stream of engineering friction, architectural breakthroughs, and solutions.
          </p>
        </div>

        <button
          type="button"
          className="refresh-action"
          onClick={loadData}
          disabled={isLoading}
          aria-label="Refresh timeline"
        >
          <span className={`refresh-icon ${isLoading ? 'is-spinning' : ''}`} aria-hidden="true">
            ↻
          </span>
          <span>{isLoading ? 'Syncing...' : 'Sync Feed'}</span>
        </button>
      </div>

      {/* Unified Search & Filter Command Bar */}
      <SearchFilterBar
        filter={filter}
        onFilterChange={setFilter}
        tags={tags}
        totalCount={totalEntriesCount}
        filteredCount={entries.length}
        onResetFilters={handleResetFilters}
      />

      {status === 'loading' ? (
        <div className="empty-state loading-state" role="status" aria-live="polite">
          <span className="loading-indicator" aria-hidden="true" />
          <h3>Retrieving Captures</h3>
          <p>Decrypting and fetching your engineering thoughts...</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="empty-state error-state">
          <h3>Failed to sync feed</h3>
          <p>{errorMessage}</p>
          <button type="button" className="secondary-action" onClick={loadData}>
            Retry Connection
          </button>
        </div>
      ) : null}

      {status === 'loaded' && entries.length === 0 ? (
        <div className="empty-state">
          {filter.q || filter.type !== 'all' || filter.status !== 'all' || filter.tag ? (
            <>
              <div className="empty-icon-badge" aria-hidden="true">🔍</div>
              <h3>No matching captures</h3>
              <p>No problems or solutions match the current search or filters.</p>
              <button
                type="button"
                className="secondary-action reset-btn"
                onClick={handleResetFilters}
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon-badge" aria-hidden="true">✨</div>
              <h3>Your repository is empty</h3>
              <p>Capture your first problem or breakthrough idea before it goes fuzzy.</p>
            </>
          )}
        </div>
      ) : null}

      {status === 'loaded' && entries.length > 0 ? (
        <ol className="timeline-list" aria-label="Captured entries">
          {entries.map((entry) => {
            const isProblem = entry.type === 'problem'
            return (
              <li
                key={entry.id}
                className={`timeline-item ${isProblem ? 'is-problem-item' : 'is-solution-item'}`}
              >
                <div className="timeline-meta">
                  <div className="timeline-badges">
                    <span className={`type-badge type-${entry.type}`}>
                      <span className="type-indicator-symbol" aria-hidden="true">
                        {isProblem ? '⚡' : '💡'}
                      </span>
                      {isProblem ? 'Problem' : 'Solution'}
                    </span>

                    <button
                      type="button"
                      className={`status-badge status-${entry.status.toLowerCase()}`}
                      onClick={() => handleStatusToggle(entry.id, entry.status)}
                      disabled={updatingId === entry.id}
                      title={`Click to switch status (currently ${entry.status})`}
                      aria-label={`Toggle status from ${entry.status}`}
                    >
                      <span className="status-beacon-dot" aria-hidden="true" />
                      <span>{updatingId === entry.id ? 'Saving...' : entry.status}</span>
                    </button>
                  </div>

                  <div className="timeline-actions-group">
                    <time dateTime={entry.createdAt} className="entry-time">
                      {dateFormatter.format(new Date(entry.createdAt))}
                    </time>
                    <button
                      type="button"
                      className="entry-action-icon edit-icon"
                      onClick={() => setEditingEntry(entry)}
                      title="Edit note"
                      aria-label={`Edit ${entry.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="entry-action-icon delete-icon"
                      onClick={() => handleDelete(entry.id, entry.title)}
                      title="Delete note"
                      aria-label={`Delete ${entry.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="timeline-content">
                  <h3>{entry.title}</h3>
                  {entry.description ? <p>{entry.description}</p> : null}
                </div>

                {entry.tags && entry.tags.length > 0 ? (
                  <div className="tag-preview" aria-label={`${entry.title} tags`}>
                    {entry.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-pill-clickable ${filter.tag?.toLowerCase() === tag.toLowerCase() ? 'is-active-tag' : ''}`}
                        onClick={() => handleTagClick(tag)}
                        title={`Filter by tag #${tag}`}
                      >
                        <span className="tag-hash">#</span>
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>
      ) : null}

      {/* Edit Entry Modal */}
      {editingEntry ? (
        <EditEntryModal
          entry={editingEntry}
          isOpen={Boolean(editingEntry)}
          onClose={() => setEditingEntry(null)}
          onSave={handleEditSave}
        />
      ) : null}
    </section>
  )
}
