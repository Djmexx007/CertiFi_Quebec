import { createClient } from '@supabase/supabase-js'
import { supabase, connectionManager } from './supabaseConnection'

// Re-export du client sécurisé
export { supabase, connectionManager }

// Log de configuration pour débogage (seulement en développement)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:', {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
    environment: import.meta.env.VITE_APP_ENV || 'development'
  });
}

// Types pour TypeScript
export interface User {
  id: string
  primerica_id: string
  email: string
  first_name: string
  last_name: string
  initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
  current_xp: number
  current_level: number
  gamified_role: string
  last_activity_at: string
  is_admin: boolean
  is_supreme_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  user_permissions?: {
    permission_id: number
    permissions: {
      name: string
      description: string
    }
  }[]
  stats?: {
    total_exams: number
    passed_exams: number
    failed_exams: number
    average_score: number
    total_podcasts_listened: number
    total_minigames_played: number
    current_streak: number
    rank_position: number
  }
}

export interface Podcast {
  id: string
  title: string
  description: string
  audio_url: string
  duration_seconds: number
  theme: string
  required_permission: string
  xp_awarded: number
  is_active: boolean
  source_document_ref: string
  created_at: string
}

export interface Question {
  id: string
  question_text: string
  question_type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options_json: Record<string, string>
  correct_answer_key: string
  explanation: string
  difficulty_level: number
  required_permission: string
  source_document_ref: string
  chapter_reference: string
  is_active: boolean
}

export interface Exam {
  id: string
  exam_name: string
  description: string
  required_permission: string
  num_questions_to_draw: number
  time_limit_minutes: number
  passing_score_percentage: number
  xp_base_reward: number
  is_active: boolean
}

export interface ExamAttempt {
  id: string
  user_id: string
  exam_id: string
  attempt_date: string
  score_percentage: number
  user_answers_json: any
  time_spent_seconds: number
  xp_earned: number
  passed: boolean
  exams?: {
    exam_name: string
    required_permission: string
  }
}

export interface Minigame {
  id: string
  game_name: string
  description: string
  game_type: string
  base_xp_gain: number
  max_daily_xp: number
  required_permission: string
  game_config_json: any
  source_document_ref: string
  is_active: boolean
}

export interface MinigameScore {
  id: string
  user_id: string
  minigame_id: string
  score: number
  max_possible_score: number
  xp_earned: number
  attempt_date: string
  game_session_data: any
}

export interface Activity {
  id: string
  user_id: string
  activity_type: string
  activity_details_json: any
  xp_gained: number
  occurred_at: string
  users?: {
    first_name: string
    last_name: string
    primerica_id: string
  }
}

export interface AdminLog {
  id: string
  admin_user_id: string
  action_type: string
  target_entity: string
  target_id: string
  details_json: any
  ip_address: string
  user_agent: string
  occurred_at: string
  users?: {
    first_name: string
    last_name: string
    primerica_id: string
  }
}

// API Helpers avec gestion d'erreur et sécurité améliorées
export class SupabaseAPI {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    // Vérifier l'état de la connexion avant de faire la requête
    const isConnected = await connectionManager.checkConnection()
    if (!isConnected) {
      throw new Error('Connexion à la base de données indisponible')
    }

    console.log('🌐 Making secure request to:', url);
    console.log('🔧 Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      hasBody: !!options.body
    });

    const controller = new AbortController()
    const timeout = parseInt(import.meta.env.VITE_APP_TIMEOUT || '30000')
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'X-Client-Info': 'certifi-quebec-web',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      console.log('📡 Response status:', response.status);
      
      if (import.meta.env.DEV) {
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText);
        
        // Gestion spécifique des erreurs de connexion
        if (response.status >= 500) {
          throw new Error('Erreur serveur temporaire. Veuillez réessayer.')
        } else if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé.')
        } else if (response.status === 404) {
          throw new Error('Ressource non trouvée.')
        }
        
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Response data received successfully');
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: La requête a pris trop de temps')
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erreur de connexion réseau')
        }
        throw error
      }
      
      throw new Error('Erreur réseau inconnue')
    }
  }

  private static async getAuthHeaders() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'X-Client-Info': 'certifi-quebec-web'
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      if (import.meta.env.DEV) {
        console.log('🔑 Auth headers prepared:', {
          hasApiKey: !!headers['apikey'],
          hasAuth: !!headers['Authorization'],
          authLength: headers['Authorization']?.length
        });
      }
      
      return headers
    } catch (error) {
      console.error('Erreur lors de la récupération des en-têtes d\'authentification:', error)
      throw new Error('Erreur d\'authentification')
    }
  }

  // Auth API - Utilise directement Supabase Auth pour plus de sécurité
  static async register(data: {
    email: string
    password: string
    primerica_id: string
    first_name: string
    last_name: string
    initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
  }) {
    console.log('📝 Registering user with Supabase Auth...');
    
    try {
      // Vérifier la connectivité
      const isConnected = await connectionManager.checkConnection()
      if (!isConnected) {
        throw new Error('Service d\'inscription temporairement indisponible')
      }

      // Validation côté client
      if (!data.email || !data.password || !data.primerica_id) {
        throw new Error('Tous les champs obligatoires doivent être remplis')
      }

      if (data.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      // Utiliser directement Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            primerica_id: data.primerica_id,
            first_name: data.first_name,
            last_name: data.last_name,
            initial_role: data.initial_role
          }
        }
      })

      if (authError) {
        console.error('❌ Auth registration error:', authError);
        
        if (authError.message.includes('already registered')) {
          throw new Error('Cette adresse email est déjà utilisée')
        }
        
        throw new Error(authError.message)
      }

      console.log('✅ Registration successful');
      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error
    }
  }

  static async login(primerica_id: string, password: string) {
    console.log('🔐 Attempting secure login for:', primerica_id);
    
    try {
      // Vérifier la connectivité
      const isConnected = await connectionManager.checkConnection()
      if (!isConnected) {
        throw new Error('Service de connexion temporairement indisponible')
      }

      // Validation côté client
      if (!primerica_id || !password) {
        throw new Error('Numéro de représentant et mot de passe requis')
      }

      // D'abord, trouver l'email associé au primerica_id
      console.log('🔍 Looking up user by primerica_id...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, is_active')
        .eq('primerica_id', primerica_id)
        .single()

      if (userError || !userData) {
        console.error('❌ User lookup failed:', userError);
        throw new Error('Numéro de représentant introuvable')
      }

      if (!userData.is_active) {
        throw new Error('Compte désactivé. Contactez l\'administrateur.')
      }

      console.log('✅ User found, attempting auth login...');
      
      // Utiliser l'email pour la connexion Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password
      })

      if (authError) {
        console.error('❌ Auth login error:', authError);
        
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Mot de passe incorrect')
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email non confirmé. Vérifiez votre boîte de réception.')
        }
        
        throw new Error(authError.message)
      }

      console.log('✅ Login successful');
      return { 
        message: 'Connexion réussie',
        session: authData.session,
        user: authData.user
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error
    }
  }

  static async resetPassword(email: string) {
    console.log('🔄 Resetting password for:', email);
    
    try {
      // Vérifier la connectivité
      const isConnected = await connectionManager.checkConnection()
      if (!isConnected) {
        throw new Error('Service de réinitialisation temporairement indisponible')
      }

      if (!email) {
        throw new Error('Adresse email requise')
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('❌ Password reset error:', error);
        throw new Error(error.message)
      }

      console.log('✅ Password reset email sent');
      return { message: 'Email de réinitialisation envoyé' }
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error
    }
  }

  // User API
  static async getUserProfile() {
    console.log('👤 Fetching user profile...');
    
    try {
      // Vérifier la connectivité
      const isConnected = await connectionManager.checkConnection()
      if (!isConnected) {
        throw new Error('Impossible de récupérer le profil utilisateur')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non authentifié')

      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          *,
          user_permissions (
            permission_id,
            permissions (name, description)
          )
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Profile fetch error:', error);
        throw new Error('Erreur lors de la récupération du profil')
      }

      // Obtenir les statistiques utilisateur si la fonction existe
      let statsData = null
      try {
        const { data } = await supabase.rpc('get_user_stats', { user_uuid: user.id })
        statsData = data
      } catch (statsError) {
        console.warn('⚠️ Stats function not available:', statsError)
      }

      console.log('✅ Profile fetched successfully');
      return { 
        profile: {
          ...profile,
          stats: statsData || {}
        }
      }
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);
      throw error
    }
  }

  // Méthodes pour les autres API endpoints avec gestion d'erreur similaire
  static async getPodcasts() {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/podcasts`, {
      headers
    })
  }

  static async markPodcastListened(podcast_id: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/podcast-listened`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ podcast_id })
    })
  }

  static async getExams(permission?: string) {
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/exams`)
    if (permission) url.searchParams.set('permission', permission)
    
    const headers = await this.getAuthHeaders()
    return this.makeRequest(url.toString(), { headers })
  }

  static async startExam(exam_id: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/start-exam?exam_id=${exam_id}`, {
      headers
    })
  }

  static async submitExam(exam_id: string, answers: Record<string, string>, time_spent_seconds: number) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/submit-exam`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ exam_id, answers, time_spent_seconds })
    })
  }

  static async getExamAttempts() {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/exam-attempts`, {
      headers
    })
  }

  static async getMinigames() {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/minigames`, {
      headers
    })
  }

  static async submitMinigameScore(data: {
    minigame_id: string
    score: number
    max_possible_score?: number
    game_session_data?: any
  }) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/submit-minigame-score`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
  }

  static async getLeaderboard(type: 'global' | 'pqap' | 'fonds_mutuels' = 'global', limit = 50) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/leaderboard?type=${type}&limit=${limit}`, {
      headers
    })
  }

  static async getRecentActivities(limit = 20) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-api/recent-activities?limit=${limit}`, {
      headers
    })
  }

  // Admin API
  static async getDashboardStats() {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/dashboard-stats`, {
      headers
    })
  }

  static async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}) {
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/users`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    const headers = await this.getAuthHeaders()
    return this.makeRequest(url.toString(), { headers })
  }

  static async getUser(userId: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/user/${userId}`, {
      headers
    })
  }

  static async updateUserPermissions(userId: string, data: {
    permissions?: number[]
    is_admin?: boolean
    is_supreme_admin?: boolean
  }) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/user-permissions/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
  }

  static async deleteUser(userId: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/user/${userId}`, {
      method: 'DELETE',
      headers
    })
  }

  static async awardXP(userId: string, xpAmount: number, reason?: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/award-xp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, xp_amount: xpAmount, reason })
    })
  }

  static async getContent(params: {
    type?: 'podcasts' | 'questions' | 'exams' | 'minigames'
    page?: number
    limit?: number
  } = {}) {
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/content`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    const headers = await this.getAuthHeaders()
    return this.makeRequest(url.toString(), { headers })
  }

  static async createContent(type: string, data: any) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/create-content`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type, data })
    })
  }

  static async updateContent(type: string, id: string, data: any) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/update-content`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type, id, data })
    })
  }

  static async deleteContent(type: string, id: string) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/content`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ type, id })
    })
  }

  static async getGlobalActivities(limit = 50) {
    const headers = await this.getAuthHeaders()
    return this.makeRequest(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/global-activities?limit=${limit}`, {
      headers
    })
  }

  static async getAdminLogs(params: {
    page?: number
    limit?: number
  } = {}) {
    const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/admin-logs`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    const headers = await this.getAuthHeaders()
    return this.makeRequest(url.toString(), { headers })
  }
}