import React from 'react';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

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
          <Dashboard user={user} />
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md">
              <LoginForm onLogin={login} loading={isLoading} />
              
              {/* Demo credentials for testing */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Comptes de démonstration :</h3>
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <strong>PQAP:</strong> 123456 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>Fonds Mutuels:</strong> 234567 / password123
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <strong>Les Deux:</strong> 345678 / password123
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