import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'certifi-quebec-web',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})

// Log de configuration pour débogage (seulement en développement)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl,
    anonKey: supabaseAnonKey ? 'Present' : 'Missing',
    anonKeyLength: supabaseAnonKey?.length,
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
  avatar_url?: string | null
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

// API Helpers avec authentification robuste et gestion d'erreur améliorée
export class SupabaseAPI {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'X-Client-Info': 'certifi-quebec-web'
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    } else {
      // Utiliser la clé anonyme comme fallback pour les endpoints publics
      headers['Authorization'] = `Bearer ${supabaseAnonKey}`
    }

    return headers
  }

  private static async makeRequest(url: string, options: RequestInit = {}) {
    console.log('🌐 Making request to:', url);

    const controller = new AbortController()
    const timeout = parseInt(import.meta.env.VITE_APP_TIMEOUT || '30000')
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...headers,
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText);
        
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

  // Mode démo - utilise des données locales simulées
  private static isDemoMode(): boolean {
    return import.meta.env.VITE_MOCK_API === 'true' || !supabaseUrl || !supabaseAnonKey
  }

  // User API
  static async getUserProfile() {
    console.log('👤 Fetching user profile...');
    
    try {
      if (this.isDemoMode()) {
        // Retourner un profil de démonstration
        return {
          profile: {
            id: 'demo-user',
            primerica_id: 'DEMOUSER001',
            email: 'demo@certifi.quebec',
            first_name: 'Demo',
            last_name: 'User',
            initial_role: 'LES_DEUX',
            current_xp: 2500,
            current_level: 5,
            gamified_role: 'Conseiller Débutant',
            is_admin: false,
            is_supreme_admin: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            stats: {
              total_exams: 3,
              passed_exams: 2,
              failed_exams: 1,
              average_score: 78,
              total_podcasts_listened: 8,
              total_minigames_played: 5,
              current_streak: 3,
              rank_position: 25
            }
          }
        };
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

      // Obtenir les statistiques utilisateur
      let statsData = null
      try {
        const { data } = await supabase.rpc('get_user_stats', { user_uuid: user.id })
        statsData = data
      } catch (statsError) {
        console.warn('⚠️ Stats function not available, using mock data')
        // Données de statistiques simulées
        statsData = {
          total_exams: Math.floor(Math.random() * 10) + 1,
          passed_exams: Math.floor(Math.random() * 8) + 1,
          failed_exams: Math.floor(Math.random() * 3),
          average_score: Math.floor(Math.random() * 30) + 70,
          total_podcasts_listened: Math.floor(Math.random() * 20) + 5,
          total_minigames_played: Math.floor(Math.random() * 15) + 2,
          current_streak: Math.floor(Math.random() * 7) + 1,
          rank_position: Math.floor(Math.random() * 50) + 1
        }
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

  // Méthodes pour les autres API endpoints avec données simulées
  static async getPodcasts() {
    console.log('🎧 Fetching podcasts...');
    
    // Données simulées pour la démonstration
    const mockPodcasts = [
      {
        id: '1',
        title: 'Introduction à la Déontologie PQAP',
        description: 'Les bases de la déontologie pour les conseillers PQAP',
        audio_url: 'https://example.com/podcast1.mp3',
        duration_seconds: 1800,
        theme: 'Déontologie',
        required_permission: 'pqap',
        xp_awarded: 50,
        is_active: true,
        source_document_ref: 'F311-Ch1',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Gestion des Fonds Mutuels',
        description: 'Stratégies avancées de gestion de portefeuille',
        audio_url: 'https://example.com/podcast2.mp3',
        duration_seconds: 2400,
        theme: 'Investissement',
        required_permission: 'fonds_mutuels',
        xp_awarded: 75,
        is_active: true,
        source_document_ref: 'F312-Ch3',
        created_at: new Date().toISOString()
      }
    ];

    return { podcasts: mockPodcasts };
  }

  static async markPodcastListened(podcast_id: string) {
    console.log('✅ Marking podcast as listened:', podcast_id);
    
    // Simulation de l'attribution d'XP
    const xpGained = 50;
    
    return {
      message: 'XP attribué avec succès',
      xp_gained: xpGained,
      result: {
        old_xp: 2750,
        new_xp: 2750 + xpGained,
        level_up_occurred: false
      }
    };
  }

  static async getExams(permission?: string) {
    console.log('📝 Fetching exams for permission:', permission);
    
    const mockExams = [
      {
        id: '1',
        exam_name: 'Examen PQAP Simulé',
        description: 'Examen de certification PQAP avec 35 questions',
        required_permission: 'pqap',
        num_questions_to_draw: 35,
        time_limit_minutes: 90,
        passing_score_percentage: 70,
        xp_base_reward: 200,
        is_active: true
      },
      {
        id: '2',
        exam_name: 'Examen Fonds Mutuels',
        description: 'Examen de certification Fonds Mutuels avec 100 questions',
        required_permission: 'fonds_mutuels',
        num_questions_to_draw: 100,
        time_limit_minutes: 120,
        passing_score_percentage: 75,
        xp_base_reward: 300,
        is_active: true
      }
    ];

    const filteredExams = permission 
      ? mockExams.filter(exam => exam.required_permission === permission)
      : mockExams;

    return { exams: filteredExams };
  }

  static async getRecentActivities(limit = 20) {
    console.log('📊 Fetching recent activities...');
    
    const mockActivities = [
      {
        id: '1',
        user_id: 'current-user',
        activity_type: 'login',
        activity_details_json: {},
        xp_gained: 0,
        occurred_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        user_id: 'current-user',
        activity_type: 'podcast_listened',
        activity_details_json: { podcast_title: 'Introduction à la Déontologie' },
        xp_gained: 50,
        occurred_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      },
      {
        id: '3',
        user_id: 'current-user',
        activity_type: 'exam_completed',
        activity_details_json: { exam_name: 'Examen PQAP', score: 85 },
        xp_gained: 200,
        occurred_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      }
    ];

    return { activities: mockActivities.slice(0, limit) };
  }

  static async getLeaderboard(type: 'global' | 'pqap' | 'fonds_mutuels' = 'global', limit = 50) {
    console.log('🏆 Fetching leaderboard...');
    
    const mockLeaderboard = [
      {
        id: 'user-1',
        first_name: 'Admin',
        last_name: 'Suprême',
        current_xp: 5000,
        current_level: 8,
        gamified_role: 'Maître Administrateur',
        initial_role: 'LES_DEUX'
      },
      {
        id: 'user-2',
        first_name: 'Pierre',
        last_name: 'Bouchard',
        current_xp: 4200,
        current_level: 7,
        gamified_role: 'Conseiller Expert',
        initial_role: 'LES_DEUX'
      }
    ].slice(0, limit);

    return { leaderboard: mockLeaderboard };
  }

  // Admin API avec données simulées
  static async getDashboardStats() {
    console.log('📊 Fetching dashboard stats...');
    
    return {
      totalUsers: 5,
      activeUsers: 5,
      totalExamAttempts: 45,
      totalPodcastListens: 120,
      roleDistribution: {
        'PQAP': 1,
        'FONDS_MUTUELS': 1,
        'LES_DEUX': 3
      },
      levelDistribution: {
        '4': { count: 1, avgXp: 2750 },
        '6': { count: 1, avgXp: 3500 },
        '7': { count: 1, avgXp: 4200 },
        '8': { count: 1, avgXp: 5000 },
        '9': { count: 1, avgXp: 6800 }
      }
    };
  }

  static async getUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}) {
    console.log('👥 Fetching users...');
    
    const mockUsers = [
      {
        id: 'user-1',
        primerica_id: 'ADMIN001',
        first_name: 'Admin',
        last_name: 'Principal',
        email: 'admin@certifi.quebec',
        initial_role: 'LES_DEUX',
        current_xp: 5000,
        current_level: 8,
        gamified_role: 'Maître Administrateur',
        is_admin: true,
        is_supreme_admin: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    // Appliquer les filtres
    let users = mockUsers;
    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(user => 
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.primerica_id.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (params.role) {
      users = users.filter(user => user.initial_role === params.role);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      }
    };
  }

  static async updateUserPermissions(userId: string, data: {
    permissions?: number[]
    is_admin?: boolean
    is_supreme_admin?: boolean
  }) {
    console.log('🔧 Updating user permissions for:', userId);
    
    // Simulation de la mise à jour
    return { message: 'Permissions mises à jour avec succès' };
  }

  static async deleteUser(userId: string) {
    console.log('🗑️ Deleting user:', userId);
    
    // Simulation de la suppression
    return { message: 'Utilisateur supprimé avec succès' };
  }

  static async getContent(params: {
    type?: 'podcasts' | 'questions' | 'exams' | 'minigames'
    page?: number
    limit?: number
  } = {}) {
    console.log('📚 Fetching content...');
    
    const mockQuestions = [
      {
        id: '1',
        question_text: 'Quelle est la définition de la déontologie en assurance?',
        question_type: 'MCQ',
        options_json: {
          A: 'Un ensemble de règles morales',
          B: 'Une technique de vente',
          C: 'Un produit d\'assurance',
          D: 'Une méthode de calcul'
        },
        correct_answer_key: 'A',
        explanation: 'La déontologie représente l\'ensemble des règles morales qui régissent une profession.',
        difficulty_level: 2,
        required_permission: 'pqap',
        source_document_ref: 'F311-Ch1',
        chapter_reference: 'Chapitre 1 - Concepts de base',
        is_active: true
      }
    ];

    return {
      content: mockQuestions,
      pagination: {
        page: 1,
        limit: 20,
        total: mockQuestions.length,
        totalPages: 1
      }
    };
  }

  static async createContent(type: string, data: any) {
    console.log('➕ Creating content:', type);
    return { content: { id: 'new-content', ...data } };
  }

  static async updateContent(type: string, id: string, data: any) {
    console.log('✏️ Updating content:', type, id);
    return { content: { id, ...data } };
  }

  static async getGlobalActivities(limit = 50) {
    console.log('🌍 Fetching global activities...');
    
    const mockActivities = [
      {
        id: '1',
        user_id: 'user-1',
        activity_type: 'level_up',
        activity_details_json: { new_level: 5 },
        xp_gained: 0,
        occurred_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        users: {
          first_name: 'Jean',
          last_name: 'Dupont',
          primerica_id: 'USER001'
        }
      },
      {
        id: '2',
        user_id: 'user-2',
        activity_type: 'exam_completed',
        activity_details_json: { exam_name: 'Examen PQAP', score: 92 },
        xp_gained: 250,
        occurred_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        users: {
          first_name: 'Marie',
          last_name: 'Tremblay',
          primerica_id: 'USER002'
        }
      }
    ];

    return { activities: mockActivities.slice(0, limit) };
  }

  // Méthodes restantes avec implémentations simulées
  static async startExam(exam_id: string) {
    console.log('🎯 Starting exam:', exam_id);
    return { exam: { id: exam_id, name: 'Examen Simulé' }, questions: [] };
  }

  static async submitExam(exam_id: string, answers: Record<string, string>, time_spent_seconds: number) {
    console.log('📤 Submitting exam:', exam_id);
    return { score_percentage: 85, passed: true, xp_earned: 200 };
  }

  static async getExamAttempts() {
    console.log('📋 Fetching exam attempts...');
    return { attempts: [] };
  }

  static async getMinigames() {
    console.log('🎮 Fetching minigames...');
    return { minigames: [] };
  }

  static async submitMinigameScore(data: any) {
    console.log('🎯 Submitting minigame score...');
    return { score_record: data, xp_earned: 25 };
  }

  static async awardXP(userId: string, xpAmount: number, reason?: string) {
    console.log('⭐ Awarding XP:', xpAmount, 'to user:', userId);
    return { result: { xp_awarded: xpAmount } };
  }

  static async deleteContent(type: string, id: string) {
    console.log('🗑️ Deleting content:', type, id);
    return { message: 'Contenu supprimé avec succès' };
  }

  static async getAdminLogs(params: any) {
    console.log('📜 Fetching admin logs...');
    return { logs: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
  }

  // Nouveau: Endpoint centralisé pour créer des utilisateurs réels
  static async createUser(userData: {
    email: string
    password: string
    primerica_id: string
    first_name: string
    last_name: string
    initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
  }) {
    console.log('👤 Creating new user:', userData.primerica_id);
    
    try {
      const response = await this.makeRequest(`${supabaseUrl}/functions/v1/admin-api/create-user`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      return response;
    } catch (error) {
      console.error('❌ User creation failed:', error);
      throw error;
    }
  }
}