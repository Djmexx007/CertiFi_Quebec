import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Clear any potentially invalid session data
try {
  const existingSession = localStorage.getItem('supabase.auth.token')
  if (existingSession) {
    const sessionData = JSON.parse(existingSession)
    const expiryTime = sessionData?.expires_at * 1000 // Convert to milliseconds
    if (Date.now() >= expiryTime) {
      localStorage.removeItem('supabase.auth.token')
    }
  }
} catch (error) {
  // If there's any error parsing the session, remove it
  localStorage.removeItem('supabase.auth.token')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
})

// Add error handling for session-related errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any remaining session data
    localStorage.removeItem('supabase.auth.token')
  }
})