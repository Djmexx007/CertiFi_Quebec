import { useState, useEffect, useRef } from 'react'
import { supabase, SupabaseAPI, type User } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  connectionStatus: 'connected' | 'disconnected' | 'checking' | 'error'
  retryCount: number
}

interface LoginCredentials {
  primerica_id: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  primerica_id: string
  first_name: string
  last_name: string
  initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
}

// Configuration des timeouts et retry
const AUTH_TIMEOUT = 15000 // 15 secondes
const CONNECTION_TIMEOUT = 10000 // 10 secondes
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 secondes

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    connectionStatus: 'checking',
    retryCount: 0
  })

  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Fonction pour vérifier si on est en mode démo
  const isDemoMode = (): boolean => {
    return import.meta.env.VITE_MOCK_API === 'true' || 
           !import.meta.env.VITE_SUPABASE_URL || 
           !import.meta.env.VITE_SUPABASE_ANON_KEY
  }

  // Fonction pour vérifier la connectivité réseau
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      // Test de connectivité basique
      if (!navigator.onLine) {
        return false
      }

      // En mode démo, toujours connecté
      if (isDemoMode()) {
        return true
      }

      // Test de connectivité Supabase avec timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        })
        clearTimeout(timeoutId)
        return response.ok || response.status === 404 // 404 est OK, cela signifie que le serveur répond
      } catch (fetchError) {
        clearTimeout(timeoutId)
        return false
      }
    } catch (error) {
      console.error('Network connectivity check failed:', error)
      return false
    }
  }

  // Fonction pour nettoyer les timeouts
  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  // Fonction pour gérer les timeouts d'authentification
  const setAuthTimeout = (callback: () => void, timeout: number = AUTH_TIMEOUT) => {
    clearTimeouts()
    timeoutRef.current = setTimeout(callback, timeout)
  }

  // Fonction pour mettre à jour le statut de connexion
  const updateConnectionStatus = async () => {
    setAuthState(prev => ({ ...prev, connectionStatus: 'checking' }))
    
    const isConnected = await checkNetworkConnectivity()
    
    setAuthState(prev => ({
      ...prev,
      connectionStatus: isConnected ? 'connected' : 'disconnected'
    }))

    return isConnected
  }

  // Charger le profil utilisateur complet avec gestion d'erreur
  const loadUserProfile = async (session: Session | any, retryAttempt = 0): Promise<boolean> => {
    try {
      setAuthTimeout(() => {
        console.error('Profile loading timeout')
        handleAuthError('Timeout lors du chargement du profil utilisateur', retryAttempt)
      })

      const { profile } = await SupabaseAPI.getUserProfile()
      
      clearTimeouts()
      
      setAuthState(prev => ({
        ...prev,
        user: profile,
        session,
        isAuthenticated: true,
        isLoading: false,
        connectionStatus: 'connected',
        retryCount: 0
      }))
      
      setError(null)
      return true
    } catch (err) {
      clearTimeouts()
      console.error('Erreur lors du chargement du profil:', err)
      return handleAuthError('Erreur lors du chargement du profil utilisateur', retryAttempt)
    }
  }

  // Gestion centralisée des erreurs avec retry
  const handleAuthError = async (errorMessage: string, retryAttempt = 0): Promise<boolean> => {
    console.error(`Auth error (attempt ${retryAttempt + 1}):`, errorMessage)

    // Vérifier la connectivité
    const isConnected = await updateConnectionStatus()
    
    if (!isConnected && !isDemoMode()) {
      setError('Problème de connexion réseau. Vérifiez votre connexion internet.')
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: 'disconnected'
      }))
      return false
    }

    // Retry logic
    if (retryAttempt < MAX_RETRY_ATTEMPTS) {
      setError(`Tentative de reconnexion... (${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS})`)
      setAuthState(prev => ({
        ...prev,
        retryCount: retryAttempt + 1
      }))

      return new Promise((resolve) => {
        retryTimeoutRef.current = setTimeout(async () => {
          try {
            if (isDemoMode()) {
              // En mode démo, simuler une session
              const demoSession = {
                access_token: 'demo-token',
                user: { id: 'demo-user', email: 'demo@example.com' }
              }
              const success = await loadUserProfile(demoSession, retryAttempt + 1)
              resolve(success)
            } else {
              const { data: { session }, error } = await supabase.auth.getSession()
              if (session && !error) {
                const success = await loadUserProfile(session, retryAttempt + 1)
                resolve(success)
              } else {
                resolve(await handleAuthError(errorMessage, retryAttempt + 1))
              }
            }
          } catch (err) {
            resolve(await handleAuthError(errorMessage, retryAttempt + 1))
          }
        }, RETRY_DELAY * (retryAttempt + 1)) // Délai progressif
      })
    }

    // Échec final
    setError(errorMessage)
    setAuthState(prev => ({
      ...prev,
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      connectionStatus: 'error'
    }))
    return false
  }

  // Fonction de retry manuel
  const retryConnection = async () => {
    setError(null)
    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      retryCount: 0,
      connectionStatus: 'checking'
    }))

    const isConnected = await updateConnectionStatus()
    if (!isConnected && !isDemoMode()) {
      setError('Impossible de se connecter au serveur')
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: 'disconnected'
      }))
      return
    }

    try {
      if (isDemoMode()) {
        // En mode démo, simuler une session
        const demoSession = {
          access_token: 'demo-token',
          user: { id: 'demo-user', email: 'demo@example.com' }
        }
        await loadUserProfile(demoSession)
      } else {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (session) {
          await loadUserProfile(session)
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            connectionStatus: 'connected'
          }))
        }
      }
    } catch (err) {
      await handleAuthError('Erreur lors de la reconnexion')
    }
  }

  useEffect(() => {
    // Éviter la double initialisation
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    // Récupérer la session initiale avec gestion d'erreur complète
    const getInitialSession = async () => {
      try {
        // Vérifier la connectivité d'abord
        const isConnected = await updateConnectionStatus()
        if (!isConnected && !isDemoMode()) {
          setError('Aucune connexion réseau détectée')
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            connectionStatus: 'disconnected'
          }))
          return
        }

        if (isDemoMode()) {
          console.log('🎭 Mode démo activé - pas de session Supabase requise')
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            connectionStatus: 'connected'
          }))
          return
        }

        // Timeout pour la récupération de session
        setAuthTimeout(() => {
          handleAuthError('Timeout lors de la récupération de la session')
        })

        const { data: { session }, error } = await supabase.auth.getSession()
        
        clearTimeouts()

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          await handleAuthError('Erreur lors de la récupération de la session')
          return
        }

        if (session) {
          await loadUserProfile(session)
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            connectionStatus: 'connected'
          }))
        }
      } catch (err) {
        clearTimeouts()
        console.error('Erreur lors de l\'initialisation de l\'auth:', err)
        await handleAuthError('Erreur lors de l\'initialisation de l\'authentification')
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification avec gestion d'erreur (seulement si pas en mode démo)
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null
    
    if (!isDemoMode()) {
      authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          try {
            if (event === 'SIGNED_IN' && session) {
              await loadUserProfile(session)
            } else if (event === 'SIGNED_OUT') {
              clearTimeouts()
              setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
                connectionStatus: 'connected',
                retryCount: 0
              })
              setError(null)
            } else if (event === 'TOKEN_REFRESHED' && session) {
              setAuthState(prev => ({
                ...prev,
                session,
                connectionStatus: 'connected'
              }))
            }
          } catch (err) {
            console.error('Error in auth state change handler:', err)
            await handleAuthError('Erreur lors du changement d\'état d\'authentification')
          }
        }
      )
    }

    // Écouter les changements de connectivité réseau
    const handleOnline = () => {
      console.log('Network back online')
      if (authState.connectionStatus === 'disconnected') {
        retryConnection()
      }
    }

    const handleOffline = () => {
      console.log('Network went offline')
      if (!isDemoMode()) {
        setAuthState(prev => ({
          ...prev,
          connectionStatus: 'disconnected'
        }))
        setError('Connexion réseau perdue')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (authListener) {
        authListener.data.subscription.unsubscribe()
      }
      clearTimeouts()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setError(null)
    setAuthState(prev => ({ ...prev, isLoading: true, retryCount: 0 }))

    try {
      // Vérifier la connectivité
      const isConnected = await updateConnectionStatus()
      if (!isConnected && !isDemoMode()) {
        throw new Error('Aucune connexion réseau disponible')
      }

      // Timeout pour la connexion
      setAuthTimeout(() => {
        throw new Error('Timeout lors de la connexion')
      }, AUTH_TIMEOUT)

      const result = await SupabaseAPI.login(credentials.primerica_id, credentials.password)
      
      clearTimeouts()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // En mode démo ou si on a une session simulée, charger le profil directement
      if (isDemoMode() || result.session?.access_token?.includes('demo')) {
        await loadUserProfile(result.session)
      }
      // Sinon, la session sera automatiquement gérée par onAuthStateChange

      return result
    } catch (err) {
      clearTimeouts()
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(errorMessage)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw err
    }
  }

  const register = async (data: RegisterData) => {
    setError(null)
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const isConnected = await updateConnectionStatus()
      if (!isConnected && !isDemoMode()) {
        throw new Error('Aucune connexion réseau disponible')
      }

      setAuthTimeout(() => {
        throw new Error('Timeout lors de l\'inscription')
      })

      const result = await SupabaseAPI.register(data)
      
      clearTimeouts()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setAuthState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (err) {
      clearTimeouts()
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription'
      setError(errorMessage)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    
    try {
      clearTimeouts()
      
      if (!isDemoMode()) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
      
      // Réinitialiser l'état manuellement
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        connectionStatus: 'connected',
        retryCount: 0
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la déconnexion'
      setError(errorMessage)
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    
    try {
      const isConnected = await updateConnectionStatus()
      if (!isConnected && !isDemoMode()) {
        throw new Error('Aucune connexion réseau disponible')
      }

      const result = await SupabaseAPI.resetPassword(email)
      
      if (result.error) {
        throw new Error(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation'
      setError(errorMessage)
      throw err
    }
  }

  const updatePassword = async (newPassword: string) => {
    setError(null)
    
    try {
      const result = await SupabaseAPI.updatePassword(newPassword)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mot de passe'
      setError(errorMessage)
      throw err
    }
  }

  const refreshProfile = async () => {
    if (!authState.session) return
    
    try {
      await loadUserProfile(authState.session)
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du profil:', err)
    }
  }

  const clearError = () => setError(null)

  return {
    ...authState,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
    clearError,
    retryConnection,
    
    // Helpers pour vérifier les permissions
    isAdmin: authState.user?.is_admin || authState.user?.is_supreme_admin || false,
    isSupremeAdmin: authState.user?.is_supreme_admin || false,
    hasPermission: (permission: string) => {
      if (!authState.user) return false
      if (authState.user.is_supreme_admin) return true
      if (authState.user.is_admin && ['admin', 'supreme_admin'].includes(permission)) return true
      
      return authState.user.user_permissions?.some(
        up => up.permissions.name === permission
      ) || false
    }
  }
}