import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { BottomNavigation } from './components/BottomNavigation'
import { CapturePage } from './pages/CapturePage'
import { TimelinePage } from './pages/TimelinePage'
import type { ThemeMode } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePreferredTheme } from './hooks/usePreferredTheme'

function App() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('probsol-theme', 'system')

  usePreferredTheme(themeMode)

  return (
    <div className="app-shell">
      <AppHeader themeMode={themeMode} onThemeModeChange={setThemeMode} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/capture" replace />} />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="*" element={<Navigate to="/capture" replace />} />
        </Routes>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default App
