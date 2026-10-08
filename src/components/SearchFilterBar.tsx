import type { EntryFilterParams, TagSummary } from '../types'

interface SearchFilterBarProps {
  filter: EntryFilterParams
  onFilterChange: (nextFilter: EntryFilterParams) => void
  tags: TagSummary[]
  totalCount: number
  filteredCount: number
  onResetFilters: () => void
}

export function SearchFilterBar({
  filter,
  onFilterChange,
  tags,
  totalCount,
  filteredCount,
  onResetFilters,
}: SearchFilterBarProps) {
  const hasActiveFilters = Boolean(
    (filter.q && filter.q.trim()) ||
      (filter.type && filter.type !== 'all') ||
      (filter.status && filter.status !== 'all') ||
      filter.tag,
  )

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, q: value })
  }

  const handleTypeChange = (type: 'all' | 'problem' | 'solution') => {
    onFilterChange({ ...filter, type })
  }

  const handleStatusChange = (status: 'all' | 'OPEN' | 'SOLVED') => {
    onFilterChange({ ...filter, status })
  }

  const handleTagToggle = (tagName: string) => {
    const isCurrent = filter.tag?.toLowerCase() === tagName.toLowerCase()
    onFilterChange({ ...filter, tag: isCurrent ? undefined : tagName })
  }

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'title') => {
    onFilterChange({ ...filter, sortBy })
  }

  return (
    <div className="search-filter-container" role="search" aria-label="Search and filter notes">
      {/* Search Input Bar */}
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          id="notes-search-input"
          type="search"
          className="search-input"
          value={filter.q || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Filter problems, solutions, architecture thoughts..."
          aria-label="Search problems and solutions"
        />
        {filter.q ? (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => handleSearchChange('')}
            aria-label="Clear search input"
          >
            ✕
          </button>
        ) : null}
      </div>

      {/* Primary Filter Rows */}
      <div className="filter-controls-grid">
        {/* Type Filter */}
        <div className="filter-group">
          <span className="filter-label">Kind</span>
          <div className="filter-pill-group" role="radiogroup" aria-label="Filter by type">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'problem', label: '🔴 Problems' },
                { id: 'solution', label: '🟢 Solutions' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`filter-pill ${(filter.type || 'all') === opt.id ? 'is-active' : ''}`}
                onClick={() => handleTypeChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <span className="filter-label">Status</span>
          <div className="filter-pill-group" role="radiogroup" aria-label="Filter by status">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'OPEN', label: 'Open' },
                { id: 'SOLVED', label: 'Solved' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`filter-pill ${(filter.status || 'all') === opt.id ? 'is-active' : ''}`}
                onClick={() => handleStatusChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="filter-group sort-group">
          <span className="filter-label">Sort</span>
          <select
            className="sort-select"
            value={filter.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest' | 'title')}
            aria-label="Sort timeline entries"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Interactive Tag Ribbon */}
      {tags.length > 0 ? (
        <div className="tag-ribbon-wrapper" aria-label="Filter by tags">
          <span className="filter-label tags-ribbon-label">Tags</span>
          <div className="tag-ribbon-scroll">
            {tags.map((t) => {
              const isSelected = filter.tag?.toLowerCase() === t.name.toLowerCase()
              return (
                <button
                  key={t.name}
                  type="button"
                  className={`tag-chip-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleTagToggle(t.name)}
                  aria-pressed={isSelected}
                  title={`Filter by #${t.name}`}
                >
                  <span className="tag-hash">#</span>
                  <span className="tag-text">{t.name}</span>
                  <span className="tag-count">{t.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Results Metadata Bar */}
      <div className="filter-meta-bar">
        <span className="filter-results-text">
          Showing <strong>{filteredCount}</strong> of {totalCount} items
          {filter.tag ? (
            <span className="active-tag-badge">
              #{filter.tag}
              <button
                type="button"
                className="remove-tag-filter"
                onClick={() => handleTagToggle(filter.tag!)}
                aria-label="Remove tag filter"
              >
                ✕
              </button>
            </span>
          ) : null}
        </span>

        {hasActiveFilters ? (
          <button
            type="button"
            className="reset-filters-link"
            onClick={onResetFilters}
            aria-label="Reset all search and filter conditions"
          >
            Clear Filters ↺
          </button>
        ) : null}
      </div>
    </div>
  )
}
