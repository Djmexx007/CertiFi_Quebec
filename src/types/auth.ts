export interface User {
  id: string;
  representantNumber: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  level: number;
  xp: number;
  isActive: boolean;
  lastLogin?: Date;
}

export type UserRole = 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  representantNumber: string;
  password: string;
  rememberMe?: boolean;
}