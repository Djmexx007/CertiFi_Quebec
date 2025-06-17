import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'certifi-quebec-web'
    }
  }
})

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

// API Helpers avec gestion d'erreur améliorée
export class SupabaseAPI {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: La requête a pris trop de temps')
        }
        throw error
      }
      
      throw new Error('Erreur réseau inconnue')
    }
  }

  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  }

  // Auth API
  static async register(data: {
    email: string
    password: string
    primerica_id: string
    first_name: string
    last_name: string
    initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
  }) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/auth-api/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  static async login(primerica_id: string, password: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/auth-api/login`, {
      method: 'POST',
      body: JSON.stringify({ primerica_id, password })
    })
  }

  static async resetPassword(email: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/auth-api/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // User API
  static async getUserProfile() {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/profile`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async getPodcasts() {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/podcasts`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async markPodcastListened(podcast_id: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/podcast-listened`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ podcast_id })
    })
  }

  static async getExams(permission?: string) {
    const url = new URL(`${supabaseUrl}/functions/v1/user-api/exams`)
    if (permission) url.searchParams.set('permission', permission)
    
    return this.makeRequest(url.toString(), {
      headers: await this.getAuthHeaders()
    })
  }

  static async startExam(exam_id: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/start-exam?exam_id=${exam_id}`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async submitExam(exam_id: string, answers: Record<string, string>, time_spent_seconds: number) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/submit-exam`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ exam_id, answers, time_spent_seconds })
    })
  }

  static async getExamAttempts() {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/exam-attempts`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async getMinigames() {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/minigames`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async submitMinigameScore(data: {
    minigame_id: string
    score: number
    max_possible_score?: number
    game_session_data?: any
  }) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/submit-minigame-score`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
  }

  static async getLeaderboard(type: 'global' | 'pqap' | 'fonds_mutuels' = 'global', limit = 50) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/leaderboard?type=${type}&limit=${limit}`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async getRecentActivities(limit = 20) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/user-api/recent-activities?limit=${limit}`, {
      headers: await this.getAuthHeaders()
    })
  }

  // Admin API
  static async getDashboardStats() {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/dashboard-stats`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}) {
    const url = new URL(`${supabaseUrl}/functions/v1/admin-api/users`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    return this.makeRequest(url.toString(), {
      headers: await this.getAuthHeaders()
    })
  }

  static async getUser(userId: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/user/${userId}`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async updateUserPermissions(userId: string, data: {
    permissions?: number[]
    is_admin?: boolean
    is_supreme_admin?: boolean
  }) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/user-permissions/${userId}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
  }

  static async deleteUser(userId: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/user/${userId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders()
    })
  }

  static async awardXP(userId: string, xpAmount: number, reason?: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/award-xp`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, xp_amount: xpAmount, reason })
    })
  }

  static async getContent(params: {
    type?: 'podcasts' | 'questions' | 'exams' | 'minigames'
    page?: number
    limit?: number
  } = {}) {
    const url = new URL(`${supabaseUrl}/functions/v1/admin-api/content`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    return this.makeRequest(url.toString(), {
      headers: await this.getAuthHeaders()
    })
  }

  static async createContent(type: string, data: any) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/create-content`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ type, data })
    })
  }

  static async updateContent(type: string, id: string, data: any) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/update-content`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ type, id, data })
    })
  }

  static async deleteContent(type: string, id: string) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/content`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ type, id })
    })
  }

  static async getGlobalActivities(limit = 50) {
    return this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/global-activities?limit=${limit}`, {
      headers: await this.getAuthHeaders()
    })
  }

  static async getAdminLogs(params: {
    page?: number
    limit?: number
  } = {}) {
    const url = new URL(`${supabaseUrl}/functions/v1/admin-api/admin-logs`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    return this.makeRequest(url.toString(), {
      headers: await this.getAuthHeaders()
    })
  }
}