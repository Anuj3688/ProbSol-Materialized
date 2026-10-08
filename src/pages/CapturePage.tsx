import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { CaptureDraft, CaptureType, EntryStatus, TagSummary } from '../types'
import { createEntry, getTags } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export function CapturePage() {
  const { user } = useAuth()
  const [type, setType] = useState<CaptureType>('problem')
  const [status, setStatus] = useState<EntryStatus>('OPEN')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [availableTags, setAvailableTags] = useState<TagSummary[]>([])
  const [titleError, setTitleError] = useState('')
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const isSubmitting = submitStatus === 'loading'

  useEffect(() => {
    getTags().then(setAvailableTags).catch(() => setAvailableTags([]))
  }, [user?.id])

  const parsedTags = useMemo(
    () =>
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  )

  const handleTypeSelect = (nextType: CaptureType) => {
    setType(nextType)
    setStatus(nextType === 'problem' ? 'OPEN' : 'SOLVED')
    setSubmitMessage('')
  }

  const handleStatusSelect = (nextStatus: EntryStatus) => {
    setStatus(nextStatus)
    setSubmitMessage('')
  }

  const handleSubmit = async (event?: FormEvent) => {
    if (event) event.preventDefault()
    setSubmitMessage('')

    if (!title.trim()) {
      setTitleError('Title is required')
      return
    }

    const nextDraft: CaptureDraft = {
      type,
      status,
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
    }

    setSubmitStatus('loading')

    try {
      const created = await createEntry(nextDraft)
      setSavedEntryId(created.id)
      setSubmitStatus('success')
      setSubmitMessage('Entry saved to vault.')
      setTitle('')
      setDescription('')
      setTags('')
      setTitleError('')
      getTags().then(setAvailableTags).catch(() => {})
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Unable to save entry.')
    }
  }

  // Support Cmd/Ctrl + Enter to quickly save note
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleAddTagSuggestion = (tagName: string) => {
    if (parsedTags.map((t) => t.toLowerCase()).includes(tagName.toLowerCase())) {
      return
    }
    const updated = tags.trim() ? `${tags.trim()}, ${tagName}` : tagName
    setTags(updated)
  }

  return (
    <section className="page-stack note-editor-page" aria-labelledby="editor-heading">
      {/* Discreet Header Bar */}
      <div className="editor-top-meta">
        <div className="editor-meta-left">
          <span className="editor-mode-label">NOTE COMPOSER</span>
          <span className="editor-breadcrumb">/ {user ? user.displayName : 'personal-vault'}</span>
        </div>
        <div className="editor-meta-right">
          <span className="hotkey-tip">
            <kbd>⌘</kbd> + <kbd>↵</kbd> to save
          </span>
        </div>
      </div>

      {/* Main Note Canvas Card */}
      <form
        className="note-composer-card"
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        noValidate
      >
        {/* Technical Metadata Toolbar */}
        <div className="note-toolbar-row">
          {/* Kind Selector: Problem vs Solution */}
          <div className="toolbar-segment" role="radiogroup" aria-label="Entry Kind">
            <span className="toolbar-label">KIND:</span>
            <div className="tech-pill-group">
              <button
                type="button"
                className={`tech-pill-btn ${type === 'problem' ? 'is-active' : ''}`}
                onClick={() => handleTypeSelect('problem')}
                aria-pressed={type === 'problem'}
              >
                Problem
              </button>
              <button
                type="button"
                className={`tech-pill-btn ${type === 'solution' ? 'is-active' : ''}`}
                onClick={() => handleTypeSelect('solution')}
                aria-pressed={type === 'solution'}
              >
                Solution
              </button>
            </div>
          </div>

          {/* Status Selector: Open vs Solved */}
          <div className="toolbar-segment" role="radiogroup" aria-label="Entry Status">
            <span className="toolbar-label">STATUS:</span>
            <div className="tech-pill-group">
              <button
                type="button"
                className={`tech-pill-btn ${status === 'OPEN' ? 'is-active' : ''}`}
                onClick={() => handleStatusSelect('OPEN')}
                aria-pressed={status === 'OPEN'}
              >
                <span className="status-micro-dot dot-open" />
                Open
              </button>
              <button
                type="button"
                className={`tech-pill-btn ${status === 'SOLVED' ? 'is-active' : ''}`}
                onClick={() => handleStatusSelect('SOLVED')}
                aria-pressed={status === 'SOLVED'}
              >
                <span className="status-micro-dot dot-solved" />
                Solved
              </button>
            </div>
          </div>
        </div>

        {/* Note Title Input */}
        <div className="note-title-wrapper">
          <input
            id="note-title-input"
            className={`note-title-field ${titleError ? 'has-error' : ''}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setTitleError('')
              setSubmitMessage('')
            }}
            placeholder="Title: What problem or breakthrough did you encounter?"
            disabled={isSubmitting}
            autoFocus
          />
          {titleError ? <p className="field-error-msg">{titleError}</p> : null}
        </div>

        {/* Note Description / Body Field */}
        <div className="note-body-wrapper">
          <textarea
            id="note-body-textarea"
            className="note-body-field"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setSubmitMessage('')
            }}
            placeholder="Write observations, constraints, stack traces, hypotheses, or resolution steps..."
            disabled={isSubmitting}
            rows={7}
          />
        </div>

        {/* Tags Row */}
        <div className="note-tags-row">
          <div className="tags-input-group">
            <span className="tag-prefix">#</span>
            <input
              className="note-tags-field"
              value={tags}
              onChange={(e) => {
                setTags(e.target.value)
                setSubmitMessage('')
              }}
              placeholder="tags (comma separated, e.g. redis, latency, architecture)"
              disabled={isSubmitting}
            />
          </div>

          {/* Tag Suggestions */}
          {availableTags.length > 0 ? (
            <div className="tag-quick-suggestions">
              {availableTags.slice(0, 6).map((t) => (
                <button
                  key={t.name}
                  type="button"
                  className="quick-tag-chip"
                  onClick={() => handleAddTagSuggestion(t.name)}
                >
                  +{t.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Actions & Feedback Footer */}
        <div className="note-composer-footer">
          <div className="footer-status-zone">
            {submitMessage ? (
              <span className={`footer-toast ${submitStatus === 'error' ? 'is-error' : 'is-success'}`}>
                {submitStatus === 'success' ? '✓ ' : '✕ '}
                {submitMessage}
                {savedEntryId && submitStatus === 'success' ? (
                  <Link to="/timeline" className="view-timeline-link">
                    View in Timeline →
                  </Link>
                ) : null}
              </span>
            ) : (
              <span className="footer-hint">Ready to capture thought</span>
            )}
          </div>

          <div className="footer-action-zone">
            <button
              type="submit"
              className="tech-save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
