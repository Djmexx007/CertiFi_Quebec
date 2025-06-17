import React from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Interface pour la configuration de connexion
interface SupabaseConfig {
  url: string
  anonKey: string
  options?: {
    auth?: {
      autoRefreshToken?: boolean
      persistSession?: boolean
      detectSessionInUrl?: boolean
      flowType?: 'pkce' | 'implicit'
    }
    global?: {
      headers?: Record<string, string>
    }
    db?: {
      schema?: string
    }
    realtime?: {
      params?: Record<string, any>
    }
  }
}

// Validation des variables d'environnement
const validateEnvironmentVariables = (): { url: string; anonKey: string } => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('VITE_SUPABASE_URL est requis dans les variables d\'environnement')
  }

  if (!anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY est requis dans les variables d\'environnement')
  }

  // Validation du format de l'URL
  try {
    new URL(url)
  } catch {
    throw new Error('VITE_SUPABASE_URL doit être une URL valide')
  }

  // Validation basique du format JWT pour la clé anonyme
  if (!anonKey.includes('.') || anonKey.split('.').length !== 3) {
    throw new Error('VITE_SUPABASE_ANON_KEY doit être un token JWT valide')
  }

  return { url, anonKey }
}

// Test de connectivité avec gestion d'erreur améliorée
export const testSupabaseConnection = async (client: SupabaseClient): Promise<boolean> => {
  try {
    console.log('🔍 Test de connectivité Supabase...')
    
    // Test simple avec timeout plus court pour éviter les blocages
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 secondes

    try {
      // Test de base avec une requête simple vers la table users
      const { error } = await client
        .from('users')
        .select('count', { count: 'exact', head: true })
        .limit(1)
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, ce qui est OK pour le test
        console.warn('⚠️ Avertissement lors du test de connectivité:', error.message)
        return true // La connexion fonctionne même si la table n'existe pas encore
      }

      console.log('✅ Connexion Supabase établie avec succès')
      return true
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('❌ Timeout lors du test de connectivité Supabase')
        return false
      }
      
      // Log plus détaillé pour les erreurs de réseau
      console.error('❌ Erreur réseau lors du test de connectivité:', {
        name: fetchError instanceof Error ? fetchError.name : 'Unknown',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      })
      
      return false
    }
  } catch (error) {
    console.error('❌ Échec du test de connectivité Supabase:', error)
    return false
  }
}

// Création du client Supabase sécurisé avec configuration réseau améliorée
export const createSecureSupabaseClient = (): SupabaseClient => {
  try {
    console.log('🔧 Initialisation de la connexion Supabase...')
    
    // Validation des variables d'environnement
    const { url, anonKey } = validateEnvironmentVariables()
    
    // Configuration sécurisée avec options réseau améliorées
    const config: SupabaseConfig = {
      url,
      anonKey,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce' // Plus sécurisé que 'implicit'
        },
        global: {
          headers: {
            'X-Client-Info': 'certifi-quebec-web',
            'X-App-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        },
        db: {
          schema: 'public'
        }
      }
    }

    // Création du client
    const client = createClient(config.url, config.anonKey, config.options)

    console.log('✅ Client Supabase créé avec succès')
    console.log('📊 Configuration:', {
      url: config.url,
      hasAnonKey: !!config.anonKey,
      anonKeyLength: config.anonKey.length,
      authFlow: config.options?.auth?.flowType,
      persistSession: config.options?.auth?.persistSession
    })

    return client
  } catch (error) {
    console.error('❌ Erreur lors de la création du client Supabase:', error)
    throw error
  }
}

// Gestionnaire de reconnexion automatique
export class SupabaseConnectionManager {
  private client: SupabaseClient
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 3
  private reconnectDelay: number = 2000
  private connectionListeners: Array<(connected: boolean) => void> = []

  constructor(client: SupabaseClient) {
    this.client = client
    this.initializeConnection()
  }

  private async initializeConnection() {
    try {
      this.isConnected = await testSupabaseConnection(this.client)
      this.notifyListeners(this.isConnected)
      
      if (this.isConnected) {
        this.reconnectAttempts = 0
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la connexion:', error)
      this.isConnected = false
      this.notifyListeners(false)
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      this.isConnected = await testSupabaseConnection(this.client)
      this.notifyListeners(this.isConnected)
      return this.isConnected
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error)
      this.isConnected = false
      this.notifyListeners(false)
      return false
    }
  }

  public async reconnect(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Nombre maximum de tentatives de reconnexion atteint')
      return false
    }

    this.reconnectAttempts++
    console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    try {
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts))
      
      const connected = await this.checkConnection()
      
      if (connected) {
        this.reconnectAttempts = 0
        console.log('✅ Reconnexion réussie')
      }
      
      return connected
    } catch (error) {
      console.error('Erreur lors de la reconnexion:', error)
      return false
    }
  }

  public onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener)
    
    // Retourner une fonction de nettoyage
    return () => {
      const index = this.connectionListeners.indexOf(listener)
      if (index > -1) {
        this.connectionListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected)
      } catch (error) {
        console.error('Erreur dans le listener de connexion:', error)
      }
    })
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  public resetReconnectAttempts() {
    this.reconnectAttempts = 0
  }
}

// Instance globale du client et du gestionnaire de connexion
export const supabase = createSecureSupabaseClient()
export const connectionManager = new SupabaseConnectionManager(supabase)

// Hook pour surveiller l'état de la connexion
export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = React.useState(connectionManager.getConnectionStatus())
  const [reconnectAttempts, setReconnectAttempts] = React.useState(connectionManager.getReconnectAttempts())

  React.useEffect(() => {
    const unsubscribe = connectionManager.onConnectionChange((connected) => {
      setIsConnected(connected)
      setReconnectAttempts(connectionManager.getReconnectAttempts())
    })

    return unsubscribe
  }, [])

  const checkConnection = React.useCallback(async () => {
    return await connectionManager.checkConnection()
  }, [])

  const reconnect = React.useCallback(async () => {
    return await connectionManager.reconnect()
  }, [])

  return {
    isConnected,
    reconnectAttempts,
    checkConnection,
    reconnect
  }
}

// Export par défaut
export default supabase