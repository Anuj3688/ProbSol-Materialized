import { useState, type FormEvent } from 'react'
import type { CaptureDraft, CaptureType, EntryStatus, TimelineEntry } from '../types'

interface EditEntryModalProps {
  entry: TimelineEntry
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<CaptureDraft>) => Promise<void>
}

export function EditEntryModal({ entry, isOpen, onClose, onSave }: EditEntryModalProps) {
  const [type, setType] = useState<CaptureType>(entry.type)
  const [status, setStatus] = useState<EntryStatus>(entry.status)
  const [title, setTitle] = useState(entry.title)
  const [description, setDescription] = useState(entry.description || '')
  const [tags, setTags] = useState((entry.tags || []).join(', '))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title cannot be empty.')
      return
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setIsSaving(true)
    setError('')
    try {
      await onSave(entry.id, {
        type,
        status,
        title: title.trim(),
        description: description.trim(),
        tags: parsedTags,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-dialog-title">
      <div className="modal-card">
        <div className="modal-header">
          <h2 id="edit-dialog-title">Edit {type === 'problem' ? 'Problem' : 'Solution'}</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error ? <p className="field-error modal-error">{error}</p> : null}

          {/* Type Selector */}
          <div className="field-group">
            <span className="field-label">Type</span>
            <div className="segmented-control two-up" role="radiogroup">
              {(['problem', 'solution'] as const).map((t) => (
                <label key={t}>
                  <input
                    type="radio"
                    name="edit-type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Selector */}
          <div className="field-group">
            <span className="field-label">Status</span>
            <div className="segmented-control two-up" role="radiogroup">
              {(['OPEN', 'SOLVED'] as const).map((s) => (
                <label key={s}>
                  <input
                    type="radio"
                    name="edit-status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <label className="field-group">
            <span className="field-label">Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSaving}
            />
          </label>

          {/* Description */}
          <label className="field-group">
            <span className="field-label">Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </label>

          {/* Tags */}
          <label className="field-group">
            <span className="field-label">Tags (comma-separated)</span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. backend, database, redis"
              disabled={isSaving}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
