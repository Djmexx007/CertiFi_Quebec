import { useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials } from '../types/auth';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    representantNumber: '123456',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'PQAP',
    level: 3,
    xp: 2750,
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: '2',
    representantNumber: '234567',
    firstName: 'Marie',
    lastName: 'Tremblay',
    role: 'FONDS_MUTUELS',
    level: 5,
    xp: 4200,
    isActive: true,
    lastLogin: new Date()
  },
  {
    id: '3',
    representantNumber: '345678',
    firstName: 'Pierre',
    lastName: 'Bouchard',
    role: 'LES_DEUX',
    level: 7,
    xp: 6800,
    isActive: true,
    lastLogin: new Date()
  }
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth token on mount
    const checkStoredAuth = () => {
      const storedUser = localStorage.getItem('certifi_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          localStorage.removeItem('certifi_user');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication
    const user = mockUsers.find(u => u.representantNumber === credentials.representantNumber);
    
    if (!user) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Numéro de représentant introuvable');
    }

    // In a real app, verify password here
    if (credentials.password !== 'password123') {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Mot de passe incorrect');
    }

    // Store user if remember me is checked
    if (credentials.rememberMe) {
      localStorage.setItem('certifi_user', JSON.stringify(user));
    }

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('certifi_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return {
    ...authState,
    login,
    logout
  };
};