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
  question_type: 'MCQ' | 'TrueFalse' | 'ShortAnswer'
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

// API Helpers
export class SupabaseAPI {
  private static getAuthHeaders() {
    return {
      'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
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
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  static async login(primerica_id: string, password: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primerica_id, password })
    })
    return response.json()
  }

  static async resetPassword(email: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return response.json()
  }

  // User API
  static async getUserProfile() {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/profile`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getPodcasts() {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/podcasts`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async markPodcastListened(podcast_id: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/podcast-listened`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ podcast_id })
    })
    return response.json()
  }

  static async getExams(permission?: string) {
    const url = new URL(`${supabaseUrl}/functions/v1/user-api/exams`)
    if (permission) url.searchParams.set('permission', permission)
    
    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async startExam(exam_id: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/start-exam?exam_id=${exam_id}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async submitExam(exam_id: string, answers: Record<string, string>, time_spent_seconds: number) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/submit-exam`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ exam_id, answers, time_spent_seconds })
    })
    return response.json()
  }

  static async getExamAttempts() {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/exam-attempts`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getMinigames() {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/minigames`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async submitMinigameScore(data: {
    minigame_id: string
    score: number
    max_possible_score?: number
    game_session_data?: any
  }) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/submit-minigame-score`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return response.json()
  }

  static async getLeaderboard(type: 'global' | 'pqap' | 'fonds_mutuels' = 'global', limit = 50) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/leaderboard?type=${type}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getRecentActivities(limit = 20) {
    const response = await fetch(`${supabaseUrl}/functions/v1/user-api/recent-activities?limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Admin API
  static async getDashboardStats() {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/dashboard-stats`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
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
    
    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getUser(userId: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/user/${userId}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async updateUserPermissions(userId: string, data: {
    permissions?: number[]
    is_admin?: boolean
    is_supreme_admin?: boolean
  }) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/user-permissions/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return response.json()
  }

  static async deleteUser(userId: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/user/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async awardXP(userId: string, xpAmount: number, reason?: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/award-xp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, xp_amount: xpAmount, reason })
    })
    return response.json()
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
    
    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async createContent(type: string, data: any) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/create-content`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ type, data })
    })
    return response.json()
  }

  static async updateContent(type: string, id: string, data: any) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/update-content`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ type, id, data })
    })
    return response.json()
  }

  static async deleteContent(type: string, id: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/content`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ type, id })
    })
    return response.json()
  }

  static async getGlobalActivities(limit = 50) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin-api/global-activities?limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getAdminLogs(params: {
    page?: number
    limit?: number
  } = {}) {
    const url = new URL(`${supabaseUrl}/functions/v1/admin-api/admin-logs`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value.toString())
    })
    
    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    })
    return response.json()
  }
}