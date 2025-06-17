import React from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  const { user, isAuthenticated, isLoading, isAdmin, login, logout } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={isAuthenticated ? logout : undefined} />
      
      <main>
        {isAuthenticated && user ? (
          <>
            {isAdmin ? (
              <AdminDashboard user={user} />
            ) : (
              <Dashboard user={user} />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md">
              <LoginForm onLogin={login} loading={isLoading} />
              
              {/* Demo credentials for testing */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Comptes de démonstration :</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <strong>Suprême Admin:</strong> SUPREMEADMIN001 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>Admin Régulier:</strong> REGULARADMIN001 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>PQAP:</strong> PQAPUSER001 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>Fonds Mutuels:</strong> FONDSUSER001 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>Les Deux:</strong> BOTHUSER001 / password123
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;