import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GameProvider } from './components/GameState'
import { useUserProfile } from './hooks/useUserProfile'

import AppContent from './AppContent'
import AdminMenu from './pages/AdminMenu'
import AdminDashboard from './pages/AdminDashboard'
import SettingsPage from './pages/SettingsPage'
import EmailConfirmationPage from './pages/EmailConfirmationPage'
import NotFound from './pages/NotFound'
import AdminUsers from './pages/AdminUsers'
import AdminStats from './pages/AdminStats'
import AdminContent from './pages/AdminContent'
import AdminFun from './pages/AdminFun'
import AdminPanel from './pages/AdminPanel'
import LoginPage from './pages/LoginPage'

import GameProgressPage from './pages/GameProgressPage'
import BossBattlePage from './pages/BossBattlePage'

import { Loader2 } from 'lucide-react'
import AuthWrapper from './components/AuthWrapper'

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, profile } = useUserProfile()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

function App() {
  return (
    <Router>
      <GameProvider>
        <Routes>
          {/* Pages publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <AuthWrapper>
                <AppContent />
              </AuthWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthWrapper>
                <SettingsPage />
              </AuthWrapper>
            }
          />
          <Route path="/confirm-email" element={<EmailConfirmationPage />} />

          {/* Nouveaux ajouts */}
          <Route
            path="/progress"
            element={
              <AuthWrapper>
                <GameProgressPage />
              </AuthWrapper>
            }
          />
          <Route
            path="/boss"
            element={
              <AuthWrapper>
                <BossBattlePage />
              </AuthWrapper>
            }
          />

          {/* Pages Admin sécurisées */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedAdminRoute>
                <AdminMenu />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedAdminRoute>
                <AdminStats />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedAdminRoute>
                <AdminContent />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/fun"
            element={
              <ProtectedAdminRoute>
                <AdminFun />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/panel"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GameProvider>
    </Router>
  )
}

export default App