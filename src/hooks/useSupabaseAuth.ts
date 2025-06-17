import { useState, useEffect } from 'react'
import { supabase, SupabaseAPI, type User } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
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

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  })

  const [error, setError] = useState<string | null>(null)

  // Charger le profil utilisateur complet
  const loadUserProfile = async (session: Session) => {
    try {
      const { profile } = await SupabaseAPI.getUserProfile()
      setAuthState(prev => ({
        ...prev,
        user: profile,
        session,
        isAuthenticated: true,
        isLoading: false
      }))
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err)
      setAuthState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      }))
    }
  }

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          setAuthState(prev => ({ ...prev, isLoading: false }))
          return
        }

        if (session) {
          await loadUserProfile(session)
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', err)
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    getInitialSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session)
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthState(prev => ({
            ...prev,
            session
          }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setError(null)
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await SupabaseAPI.login(credentials.primerica_id, credentials.password)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // La session sera automatiquement gérée par onAuthStateChange
      return result
    } catch (err) {
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
      const result = await SupabaseAPI.register(data)
      
      if (result.error) {
        throw new Error(result.error)
      }

      setAuthState(prev => ({ ...prev, isLoading: false }))
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription'
      setError(errorMessage)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // L'état sera automatiquement mis à jour par onAuthStateChange
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la déconnexion'
      setError(errorMessage)
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    setError(null)
    
    try {
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      return { message: 'Mot de passe mis à jour avec succès' }
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