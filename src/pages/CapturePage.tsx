import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { CaptureDraft, CaptureType, EntryStatus } from '../types'
import { createEntry } from '../services/api'

const captureTypes: Array<{ value: CaptureType; label: string }> = [
  { value: 'problem', label: 'Problem' },
  { value: 'solution', label: 'Solution' },
]

const statusOptions: EntryStatus[] = ['OPEN', 'SOLVED']

type CaptureErrors = {
  type?: string
  title?: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function CapturePage() {
  const [type, setType] = useState<CaptureType | ''>('')
  const [status, setStatus] = useState<EntryStatus>('OPEN')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<CaptureErrors>({})
  const [savedDraft, setSavedDraft] = useState<CaptureDraft | null>(null)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const isSubmitting = submitStatus === 'loading'

  const parsedTags = useMemo(
    () =>
      tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  )

  const validate = () => {
    const nextErrors: CaptureErrors = {}

    if (!type) {
      nextErrors.type = 'Choose Problem or Solution.'
    }

    if (!title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const resetForm = () => {
    setType('')
    setStatus('OPEN')
    setTitle('')
    setDescription('')
    setTags('')
    setErrors({})
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')

    if (!validate()) {
      setSubmitStatus('idle')
      return
    }

    const nextDraft: CaptureDraft = {
      type: type as CaptureType,
      status,
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
    }

    setSubmitStatus('loading')

    try {
      await createEntry(nextDraft)
      setSavedDraft(nextDraft)
      setSubmitStatus('success')
      setSubmitMessage('Saved to Google Sheets.')
      resetForm()
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Unable to save entry.')
    }
  }

  const handleTypeChange = (nextType: CaptureType) => {
    setType(nextType)
    setStatus(nextType === 'problem' ? 'OPEN' : 'SOLVED')
    setErrors((currentErrors) => ({ ...currentErrors, type: undefined }))
    setSubmitMessage('')
  }

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle)
    setErrors((currentErrors) => ({ ...currentErrors, title: undefined }))
    setSubmitMessage('')
  }

  return (
    <section className="page-stack" aria-labelledby="capture-title">
      <div className="section-heading">
        <p className="eyebrow">Just Let it Flow</p>
        <h2 id="capture-title">Time to dump your brains out</h2>
        <p>Capture a problem or solution while the context is still fresh.</p>
      </div>

      <form className="capture-form capture-card" onSubmit={handleSubmit} noValidate>
        <fieldset className={errors.type ? 'field-group has-error' : 'field-group'}>
          <legend>
            Type <span aria-hidden="true">*</span>
          </legend>
          <div className="segmented-control two-up" role="radiogroup" aria-describedby="type-error">
            {captureTypes.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={type === option.value}
                  disabled={isSubmitting}
                  onChange={() => handleTypeChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.type ? (
            <p className="field-error" id="type-error">
              {errors.type}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="field-group">
          <legend>Status</legend>
          <div className="segmented-control two-up" role="radiogroup">
            {statusOptions.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="status"
                  value={option}
                  checked={status === option}
                  disabled={isSubmitting}
                  onChange={() => {
                    setStatus(option)
                    setSubmitMessage('')
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={errors.title ? 'field-group has-error' : 'field-group'}>
          <span>
            Title <span aria-hidden="true">*</span>
          </span>
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Example: Login takes too long on mobile"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="title-error"
          />
          {errors.title ? (
            <p className="field-error" id="title-error">
              {errors.title}
            </p>
          ) : null}
        </label>

        <label className="field-group">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setSubmitMessage('')
            }}
            placeholder="Add observations, constraints, ideas, or next steps."
            disabled={isSubmitting}
            rows={6}
          />
        </label>

        <label className="field-group">
          <span>Tags</span>
          <input
            value={tags}
            onChange={(event) => {
              setTags(event.target.value)
              setSubmitMessage('')
            }}
            placeholder="mobile, onboarding, auth"
            disabled={isSubmitting}
          />
        </label>

        {parsedTags.length > 0 ? (
          <div className="tag-preview" aria-label="Tags preview">
            {parsedTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}

        {submitMessage ? (
          <p
            className={`submit-message ${submitStatus === 'error' ? 'is-error' : 'is-success'}`}
            role={submitStatus === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            {submitMessage}
          </p>
        ) : null}

        <button type="submit" className="primary-action" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save entry'}
        </button>
      </form>

      {savedDraft ? (
        <aside className="draft-preview" aria-label="Saved draft preview">
          <div>
            <p className="eyebrow">{savedDraft.type}</p>
            <h3>{savedDraft.title}</h3>
          </div>
          <span className={`status-badge status-${savedDraft.status.toLowerCase()}`}>
            {savedDraft.status}
          </span>
          {savedDraft.description ? <p>{savedDraft.description}</p> : null}
          {savedDraft.tags.length > 0 ? (
            <div className="tag-preview">
              {savedDraft.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </aside>
      ) : null}
    </section>
  )
}
