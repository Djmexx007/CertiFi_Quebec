import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUserProfile'
import {
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Loader2,
  User,
  Home,
  BookOpen,
  Shield
} from 'lucide-react'

interface HeaderBarProps {
  title?: string
  rightElement?: React.ReactNode
}

export default function HeaderBar({ title = 'CertiFi Québec', rightElement }: HeaderBarProps) {
  const [open, setOpen] = useState(false)
  const { profile, loading, signOut, refreshProfile } = useUserProfile()
  const navigate = useNavigate()

  // Force refresh profile data every 10 seconds to ensure XP updates are visible
  // But only if we're not already loading and we have a profile
  useEffect(() => {
    const interval = setInterval(() => {
      if (profile && !loading) {
        console.log('Auto-refreshing profile data...');
        refreshProfile();
      }
    }, 10000); // Increased to 10 seconds to reduce load
    
    return () => clearInterval(interval);
  }, [refreshProfile, profile, loading]);

  // Memoize username and avatar to prevent unnecessary re-renders
  const username = profile?.username?.trim() || 'Utilisateur'
  const avatar = profile?.avatar_url?.trim() && !profile.avatar_url.includes('null')
    ? profile.avatar_url
    : 'https://vmjdzgxrprnhhcffuwmz.supabase.co/storage/v1/object/public/avatars/default-avatar.png'

  // Calculate level from XP
  const level = Math.floor((profile?.xp ?? 0) / 1000) + 1;

  // Memoize the toggle function
  const toggleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white border-b border-gray-200 text-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="font-bold text-lg flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          {title}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="animate-spin w-4 h-4" />
          Chargement...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 text-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
      <button
        onClick={() => navigate('/')}
        className="font-bold text-lg flex items-center gap-2 hover:text-blue-600 transition-colors"
      >
        <Shield className="w-6 h-6 text-blue-600" />
        {title}
      </button>

      <div className="flex items-center gap-4 relative">
        {rightElement}
        
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-sm transition-colors"
        >
          <img
            src={avatar}
            alt="Avatar"
            className="w-6 h-6 rounded-full border border-blue-200 object-cover"
          />
          <span className="max-w-[120px] truncate text-gray-700">{username}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-3 z-50">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <img
                src={avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-blue-200 object-cover"
              />
              <div>
                <div className="font-medium text-gray-800">
                  {username}
                  <span className="text-xs text-blue-600 ml-1">
                    ({profile.role || 'user'})
                  </span>
                </div>
                <div className="text-xs text-blue-600">
                  Niveau {level}
                </div>
                <div className="text-xs text-blue-500/80">
                  {profile.xp ?? 0} XP
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(false)
                navigate('/')
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-blue-50 rounded text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>

            <button
              onClick={() => {
                setOpen(false)
                navigate('/settings')
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-blue-50 rounded text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>

            {profile.role === 'admin' && (
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/admin')
                }}
                className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-yellow-50 text-yellow-700 rounded text-sm transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Administration
              </button>
            )}

            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-red-50 text-red-600 rounded text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}