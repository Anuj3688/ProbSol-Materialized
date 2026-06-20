import type { ThemeMode } from '../types'

type AppHeaderProps = {
  themeMode: ThemeMode
  onThemeModeChange: (themeMode: ThemeMode) => void
}

const themeModes: ThemeMode[] = ['system', 'light', 'dark']

export function AppHeader({ themeMode, onThemeModeChange }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">ProbSol Materialised</p>
        <h1>Capture problems before they go fuzzy.</h1>
      </div>

      <label className="theme-picker">
        <span>Theme</span>
        <select value={themeMode} onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}>
          {themeModes.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </label>
    </header>
  )
}
