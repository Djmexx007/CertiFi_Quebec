import React from 'react';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ConnectionStatus } from './components/ConnectionStatus';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isAdmin, 
    connectionStatus,
    error,
    retryCount,
    login, 
    logout,
    retryConnection,
    clearError
  } = useSupabaseAuth();

  // Affichage de l'état de chargement avec gestion des timeouts
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <LoadingSpinner 
            size="lg" 
            message="Initialisation de l'application..."
            timeout={retryCount > 0}
            onTimeout={retryConnection}
          />
          
          {/* Afficher le statut de connexion si nécessaire */}
          {(connectionStatus !== 'connected' || error) && (
            <ConnectionStatus
              status={connectionStatus}
              error={error}
              retryCount={retryCount}
              onRetry={retryConnection}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={isAuthenticated ? logout : undefined} />
      
      {/* Afficher les problèmes de connexion en haut de page */}
      {(connectionStatus !== 'connected' || error) && isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ConnectionStatus
            status={connectionStatus}
            error={error}
            retryCount={retryCount}
            onRetry={retryConnection}
          />
        </div>
      )}
      
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
            <div className="w-full max-w-md space-y-6">
              {/* Afficher les problèmes de connexion avant le formulaire */}
              {(connectionStatus !== 'connected' || error) && (
                <ConnectionStatus
                  status={connectionStatus}
                  error={error}
                  retryCount={retryCount}
                  onRetry={retryConnection}
                />
              )}
              
              <LoginForm 
                onLogin={login} 
                loading={isLoading}
                disabled={connectionStatus !== 'connected'}
                onClearError={clearError}
                error={error}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;