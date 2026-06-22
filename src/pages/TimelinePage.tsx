import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EntryStatus, TimelineEntry } from '../types'
import { getEntries, updateEntryStatus } from '../services/api'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const isLoading = status === 'loading'

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (firstEntry, secondEntry) =>
          new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime(),
      ),
    [entries],
  )

  const loadEntries = useCallback(async () => {
    setStatus('loading')
    setErrorMessage('')

    try {
      const nextEntries = await getEntries()
      setEntries(nextEntries)
      setStatus('loaded')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load entries.')
      setStatus('error')
    }
  }, [])

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

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  return (
    <section className="page-stack timeline-page" aria-labelledby="timeline-title">
      <div className="timeline-topbar">
        <div className="section-heading">
          <p className="eyebrow">Timeline</p>
          <h2 id="timeline-title">Recent captures</h2>
          <p>Review problems and solutions in newest-first order.</p>
        </div>

        <button
          type="button"
          className="refresh-action"
          onClick={loadEntries}
          disabled={isLoading}
          aria-label="Refresh timeline"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {status === 'loading' ? (
        <div className="empty-state" role="status" aria-live="polite">
          <span className="loading-indicator" aria-hidden="true" />
          <h3>Loading timeline</h3>
          <p>Fetching your latest captures from Google Sheets.</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="empty-state">
          <h3>Could not load entries</h3>
          <p>{errorMessage}</p>
          <button type="button" className="secondary-action" onClick={loadEntries}>
            Try again
          </button>
        </div>
      ) : null}

      {status === 'loaded' && entries.length === 0 ? (
        <div className="empty-state">
          <h3>No entries yet</h3>
          <p>Saved problems and solutions will appear here.</p>
        </div>
      ) : null}

      {status === 'loaded' && sortedEntries.length > 0 ? (
        <ol className="timeline-list" aria-label="Captured entries">
          {sortedEntries.map((entry) => (
            <li key={entry.id} className="timeline-item">
              <div className="timeline-meta">
                <div className="timeline-badges">
                  <span className={`type-badge type-${entry.type}`}>{entry.type}</span>
                  <button
                    type="button"
                    className={`status-badge status-${entry.status.toLowerCase()}`}
                    onClick={() => handleStatusToggle(entry.id, entry.status)}
                    disabled={updatingId === entry.id}
                    title={`Click to toggle status from ${entry.status} to ${entry.status === 'OPEN' ? 'SOLVED' : 'OPEN'}`}
                    aria-label={`Toggle status from ${entry.status}`}
                  >
                    {updatingId === entry.id ? 'Updating...' : entry.status}
                  </button>
                </div>
                <time dateTime={entry.createdAt}>{dateFormatter.format(new Date(entry.createdAt))}</time>
              </div>

              <div className="timeline-content">
                <h3>{entry.title}</h3>
                {entry.description ? <p>{entry.description}</p> : null}
              </div>

              {entry.tags.length > 0 ? (
                <div className="tag-preview" aria-label={`${entry.title} tags`}>
                  {entry.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
