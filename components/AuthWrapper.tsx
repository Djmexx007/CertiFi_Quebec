import { useLocation, Navigate } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUserProfile()
  const location = useLocation()
  const [authChecked, setAuthChecked] = useState(false)
  
  // Add an additional check for invalid sessions
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          // Clear any potentially corrupted session data
          localStorage.removeItem('supabase.auth.token')
        }
        setAuthChecked(true)
      } catch (e) {
        console.error('Error checking session:', e)
        localStorage.removeItem('supabase.auth.token')
        setAuthChecked(true)
      }
    }
    
    checkSession()
  }, [])

  if (loading || !authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!profile && location.pathname !== '/') {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}