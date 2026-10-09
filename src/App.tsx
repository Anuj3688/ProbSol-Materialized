import { Navigate, Route, Routes } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import './App.css'
import { AppHeader } from './components/AppHeader'
import { CapturePage } from './pages/CapturePage'
import { TimelinePage } from './pages/TimelinePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import Splash from './components/Splash'
import type { ThemeMode } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePreferredTheme } from './hooks/usePreferredTheme'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="page-stack" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p className="eyebrow">Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('probsol-theme', 'system')

  usePreferredTheme(themeMode)

  return (
    <div className="app-shell">
      {showSplash && (
        <Splash
          durationMs={2000}
          onFinish={() => setShowSplash(false)}
        />
      )}

      <AppHeader themeMode={themeMode} onThemeModeChange={setThemeMode} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/capture"
            element={
              <ProtectedRoute>
                <CapturePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <TimelinePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
