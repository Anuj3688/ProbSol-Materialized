import { Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { BottomNavigation } from './components/BottomNavigation'
import { CapturePage } from './pages/CapturePage'
import { TimelinePage } from './pages/TimelinePage'
import Splash from './components/Splash'
import type { ThemeMode } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePreferredTheme } from './hooks/usePreferredTheme'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('probsol-theme', 'system')

  usePreferredTheme(themeMode)

  return (
    <div className="app-shell">
      {showSplash && (
        <Splash
          durationMs={3000}
          onFinish={() => setShowSplash(false)}
        />
      )}

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
