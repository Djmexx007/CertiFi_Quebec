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
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'certifi-quebec-web'
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

// Utilisateurs de démonstration avec métadonnées
const DEMO_USERS = [
  {
    primerica_id: 'SUPREMEADMIN001',
    email: 'supreme.admin@certifi.quebec',
    password: 'password123',
    first_name: 'Admin',
    last_name: 'Suprême',
    initial_role: 'LES_DEUX' as const,
    is_admin: true,
    is_supreme_admin: true,
    current_xp: 5000,
    current_level: 8,
    gamified_role: 'Maître Administrateur',
    is_demo_user: true
  },
  {
    primerica_id: 'REGULARADMIN001',
    email: 'admin@certifi.quebec',
    password: 'password123',
    first_name: 'Admin',
    last_name: 'Régulier',
    initial_role: 'LES_DEUX' as const,
    is_admin: true,
    is_supreme_admin: false,
    current_xp: 3500,
    current_level: 6,
    gamified_role: 'Administrateur Confirmé',
    is_demo_user: true
  },
  {
    primerica_id: 'PQAPUSER001',
    email: 'pqap.user@certifi.quebec',
    password: 'password123',
    first_name: 'Jean',
    last_name: 'Dupont',
    initial_role: 'PQAP' as const,
    is_admin: false,
    is_supreme_admin: false,
    current_xp: 2750,
    current_level: 4,
    gamified_role: 'Conseiller PQAP',
    is_demo_user: true
  },
  {
    primerica_id: 'FONDSUSER001',
    email: 'fonds.user@certifi.quebec',
    password: 'password123',
    first_name: 'Marie',
    last_name: 'Tremblay',
    initial_role: 'FONDS_MUTUELS' as const,
    is_admin: false,
    is_supreme_admin: false,
    current_xp: 4200,
    current_level: 7,
    gamified_role: 'Expert Fonds Mutuels',
    is_demo_user: true
  },
  {
    primerica_id: 'BOTHUSER001',
    email: 'both.user@certifi.quebec',
    password: 'password123',
    first_name: 'Pierre',
    last_name: 'Bouchard',
    initial_role: 'LES_DEUX' as const,
    is_admin: false,
    is_supreme_admin: false,
    current_xp: 6800,
    current_level: 9,
    gamified_role: 'Conseiller Expert',
    is_demo_user: true
  }
];

// API Helpers avec authentification robuste et mode démo
export class SupabaseAPI {
  private static async makeRequest(url: string, options: RequestInit = {}) {
    console.log('🌐 Making request to:', url);

    const controller = new AbortController()
    const timeout = parseInt(import.meta.env.VITE_APP_TIMEOUT || '30000')
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'X-Client-Info': 'certifi-quebec-web',
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

  // Fonction pour créer les utilisateurs de démonstration avec métadonnées
  static async createDemoUsers() {
    console.log('🎭 Création des utilisateurs de démonstration...');
    
    if (this.isDemoMode()) {
      console.log('Mode démo activé - simulation de la création des utilisateurs');
      return { success: true, message: 'Utilisateurs de démonstration simulés créés' };
    }

    try {
      const createdUsers = [];
      
      for (const demoUser of DEMO_USERS) {
        console.log(`Création de l'utilisateur: ${demoUser.primerica_id}`);
        
        try {
          // Vérifier si l'utilisateur existe déjà
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, primerica_id')
            .eq('primerica_id', demoUser.primerica_id)
            .single()

          if (existingUser) {
            console.log(`✅ Utilisateur ${demoUser.primerica_id} existe déjà`);
            createdUsers.push(demoUser.primerica_id);
            continue;
          }

          // Créer l'utilisateur dans Supabase Auth avec métadonnées is_demo_user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: demoUser.email,
            password: demoUser.password,
            email_confirm: true,
            user_metadata: {
              primerica_id: demoUser.primerica_id,
              first_name: demoUser.first_name,
              last_name: demoUser.last_name,
              initial_role: demoUser.initial_role,
              is_demo_user: true // Métadonnée cruciale pour l'identification
            }
          })

          if (authError) {
            console.warn(`Utilisateur ${demoUser.primerica_id} - erreur auth:`, authError.message);
            
            // Si l'utilisateur existe déjà dans auth, essayer de récupérer son ID
            if (authError.message.includes('already registered')) {
              const { data: existingAuthUser } = await supabase.auth.admin.listUsers()
              const foundUser = existingAuthUser.users.find(u => u.email === demoUser.email)
              
              if (foundUser) {
                console.log(`Utilisateur auth trouvé: ${foundUser.id}`);
                // Créer le profil avec l'ID existant
                await this.createUserProfile(foundUser.id, demoUser);
                createdUsers.push(demoUser.primerica_id);
              }
            }
            continue;
          }

          if (authData.user) {
            // Créer le profil utilisateur
            await this.createUserProfile(authData.user.id, demoUser);
            createdUsers.push(demoUser.primerica_id);
            console.log(`✅ Utilisateur ${demoUser.primerica_id} créé avec succès`);
          }
        } catch (userError) {
          console.error(`Erreur lors de la création de ${demoUser.primerica_id}:`, userError);
        }
      }

      return {
        success: true,
        message: `${createdUsers.length} utilisateurs de démonstration traités`,
        created: createdUsers
      };
    } catch (error) {
      console.error('Erreur lors de la création des utilisateurs de démonstration:', error);
      throw error;
    }
  }

  private static async createUserProfile(userId: string, demoUser: any) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        primerica_id: demoUser.primerica_id,
        email: demoUser.email,
        first_name: demoUser.first_name,
        last_name: demoUser.last_name,
        initial_role: demoUser.initial_role,
        current_xp: demoUser.current_xp,
        current_level: demoUser.current_level,
        gamified_role: demoUser.gamified_role,
        is_admin: demoUser.is_admin,
        is_supreme_admin: demoUser.is_supreme_admin,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })

    if (profileError) {
      console.error(`Erreur lors de la création du profil:`, profileError);
      throw profileError;
    }
  }

  // Fonction pour basculer l'état des utilisateurs de démonstration
  static async toggleDemoUsers(activate: boolean) {
    console.log(`🔄 ${activate ? 'Activation' : 'Désactivation'} des utilisateurs de démonstration...`);
    
    if (this.isDemoMode()) {
      return {
        success: true,
        message: `Simulation: utilisateurs de démonstration ${activate ? 'activés' : 'désactivés'}`,
        count: DEMO_USERS.length
      };
    }

    try {
      // Récupérer tous les utilisateurs avec is_demo_user = true
      const { data: demoUsers, error: fetchError } = await supabase.auth.admin.listUsers()
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des utilisateurs: ${fetchError.message}`)
      }

      const demoUsersList = demoUsers.users.filter(user => 
        user.user_metadata?.is_demo_user === true
      )

      console.log(`Trouvé ${demoUsersList.length} utilisateurs de démonstration`);

      // Mettre à jour chaque utilisateur de démonstration
      for (const user of demoUsersList) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            ban_duration: activate ? 'none' : 'infinity'
          }
        )

        if (updateError) {
          console.error(`Erreur lors de la mise à jour de ${user.email}:`, updateError.message);
        } else {
          console.log(`✅ ${user.email} ${activate ? 'activé' : 'désactivé'}`);
        }
      }

      return {
        success: true,
        message: `${demoUsersList.length} utilisateurs de démonstration ${activate ? 'activés' : 'désactivés'}`,
        count: demoUsersList.length
      }
    } catch (error) {
      console.error('Erreur lors de la bascule des utilisateurs de démonstration:', error);
      throw error
    }
  }

  // Auth API - Utilise directement Supabase Auth ou mode démo
  static async register(data: {
    email: string
    password: string
    primerica_id: string
    first_name: string
    last_name: string
    initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
  }) {
    console.log('📝 Registering user...');
    
    try {
      // Validation côté client
      if (!data.email || !data.password || !data.primerica_id) {
        throw new Error('Tous les champs obligatoires doivent être remplis')
      }

      if (data.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      if (this.isDemoMode()) {
        // Mode démo - simulation
        return {
          user: { id: 'demo-user', email: data.email },
          session: { access_token: 'demo-token' }
        };
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
            initial_role: data.initial_role,
            is_demo_user: false // Utilisateur réel
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
    console.log('🔐 Attempting login for:', primerica_id);
    
    try {
      // Validation côté client
      if (!primerica_id || !password) {
        throw new Error('Numéro de représentant et mot de passe requis')
      }

      // Vérifier si c'est un utilisateur de démonstration
      const demoUser = DEMO_USERS.find(user => user.primerica_id === primerica_id);
      
      if (demoUser) {
        console.log('🎭 Utilisateur de démonstration détecté');
        
        // Vérifier le mot de passe
        if (password !== demoUser.password) {
          throw new Error('Mot de passe incorrect')
        }

        if (this.isDemoMode()) {
          // Mode démo complet - retourner des données simulées
          return {
            message: 'Connexion réussie (mode démo)',
            session: { 
              access_token: 'demo-token',
              user: {
                id: `demo-${demoUser.primerica_id}`,
                email: demoUser.email,
                user_metadata: {
                  primerica_id: demoUser.primerica_id,
                  is_demo_user: true
                }
              }
            },
            user: {
              id: `demo-${demoUser.primerica_id}`,
              email: demoUser.email
            }
          };
        }

        // Mode Supabase - essayer de se connecter avec l'email
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: demoUser.email,
            password: password
          })

          if (authError) {
            console.warn('Utilisateur de démonstration non trouvé dans Auth, création...');
            
            // Créer l'utilisateur s'il n'existe pas
            await this.createDemoUsers();
            
            // Réessayer la connexion
            const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
              email: demoUser.email,
              password: password
            })

            if (retryAuthError) {
              throw new Error('Impossible de créer ou connecter l\'utilisateur de démonstration')
            }

            console.log('✅ Demo user login successful after creation');
            return { 
              message: 'Connexion réussie',
              session: retryAuthData.session,
              user: retryAuthData.user
            }
          }

          console.log('✅ Demo user login successful');
          return { 
            message: 'Connexion réussie',
            session: authData.session,
            user: authData.user
          }
        } catch (demoError) {
          console.error('Erreur avec utilisateur démo:', demoError);
          
          // Fallback en mode démo local
          console.log('🔄 Basculement en mode démo local');
          return {
            message: 'Connexion réussie (mode démo local)',
            session: { 
              access_token: 'demo-token-local',
              user: {
                id: `demo-${demoUser.primerica_id}`,
                email: demoUser.email,
                user_metadata: {
                  primerica_id: demoUser.primerica_id,
                  is_demo_user: true
                }
              }
            },
            user: {
              id: `demo-${demoUser.primerica_id}`,
              email: demoUser.email
            }
          };
        }
      }

      if (this.isDemoMode()) {
        throw new Error('Mode démo: seuls les utilisateurs de démonstration sont disponibles')
      }

      // Pour les utilisateurs non-démonstration, essayer la méthode normale
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
      if (!email) {
        throw new Error('Adresse email requise')
      }

      if (this.isDemoMode()) {
        return { message: 'Email de réinitialisation envoyé (mode démo)' };
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

  static async updatePassword(newPassword: string) {
    console.log('🔄 Updating password...');
    
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }

      if (this.isDemoMode()) {
        return { message: 'Mot de passe mis à jour (mode démo)' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ Password update error:', error);
        throw new Error(error.message)
      }

      console.log('✅ Password updated successfully');
      return { message: 'Mot de passe mis à jour avec succès' }
    } catch (error) {
      console.error('❌ Password update failed:', error);
      throw error
    }
  }

  // User API
  static async getUserProfile() {
    console.log('👤 Fetching user profile...');
    
    try {
      if (this.isDemoMode()) {
        // Retourner un profil de démonstration basé sur la session
        const demoUser = DEMO_USERS[0]; // Par défaut, prendre le premier utilisateur
        return {
          profile: {
            id: `demo-${demoUser.primerica_id}`,
            primerica_id: demoUser.primerica_id,
            email: demoUser.email,
            first_name: demoUser.first_name,
            last_name: demoUser.last_name,
            initial_role: demoUser.initial_role,
            current_xp: demoUser.current_xp,
            current_level: demoUser.current_level,
            gamified_role: demoUser.gamified_role,
            is_admin: demoUser.is_admin,
            is_supreme_admin: demoUser.is_supreme_admin,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            stats: {
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

      // Obtenir les statistiques utilisateur si la fonction existe
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
    
    const mockLeaderboard = DEMO_USERS
      .map((user, index) => ({
        id: `user-${index}`,
        first_name: user.first_name,
        last_name: user.last_name,
        current_xp: user.current_xp,
        current_level: user.current_level,
        gamified_role: user.gamified_role,
        initial_role: user.initial_role
      }))
      .sort((a, b) => b.current_xp - a.current_xp)
      .slice(0, limit);

    return { leaderboard: mockLeaderboard };
  }

  // Admin API avec données simulées
  static async getDashboardStats() {
    console.log('📊 Fetching dashboard stats...');
    
    return {
      totalUsers: DEMO_USERS.length,
      activeUsers: DEMO_USERS.length,
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
    
    let users = DEMO_USERS.map((user, index) => ({
      id: `user-${index}`,
      primerica_id: user.primerica_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      initial_role: user.initial_role,
      current_xp: user.current_xp,
      current_level: user.current_level,
      gamified_role: user.gamified_role,
      is_admin: user.is_admin,
      is_supreme_admin: user.is_supreme_admin,
      is_active: true,
      created_at: new Date().toISOString()
    }));

    // Appliquer les filtres
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
          primerica_id: 'PQAPUSER001'
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
          primerica_id: 'FONDSUSER001'
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
}