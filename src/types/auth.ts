export interface User {
  id: string;
  primerica_id: string;
  email: string;
  first_name: string;
  last_name: string;
  initial_role: UserRole;
  current_level: number;
  current_xp: number;
  gamified_role: string;
  is_admin: boolean;
  is_supreme_admin: boolean;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  user_permissions?: {
    permission_id: number;
    permissions: {
      name: string;
      description: string;
    };
  }[];
  stats?: {
    total_exams: number;
    passed_exams: number;
    failed_exams: number;
    average_score: number;
    total_podcasts_listened: number;
    total_minigames_played: number;
    current_streak: number;
    rank_position: number;
  };
}

export type UserRole = 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  primerica_id: string;
  password: string;
  rememberMe?: boolean;
}