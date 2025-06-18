import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useUserProfile() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingOperation, setLoadingOperation] = useState(false)

  const loadProfile = useCallback(async () => {
    // Don't start a new loading operation if one is already in progress
    if (loadingOperation) {
      console.log('Profile loading operation already in progress, skipping');
      return;
    }

    setLoadingOperation(true);
    console.log('Loading user profile...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Session error:', sessionError);
        setLoading(false);
        setLoadingOperation(false);
        return;
      }
      
      if (!session?.user) {
        console.log('No user session found');
        setLoading(false);
        setLoadingOperation(false);
        return;
      }

      setSession(session)

      const userId = session.user.id
      const email = session.user.email ?? ''
      const defaultUsername = email.split('@')[0]

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching profile:', error);
          
          // If profile doesn't exist, create a new one
          if (error.code === 'PGRST116') {
            console.log('Creating new profile for user:', userId);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                username: defaultUsername,
                avatar_url: '',
                role: 'user',
                xp: 0,
                chapters_completed: [],
                email,
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError);
            } else {
              console.log('New profile created:', newProfile);
              setProfile(newProfile);
            }
          }
        } else if (profileData) {
          console.log('Profile loaded:', profileData);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in profile operations:', error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setLoadingOperation(false);
      console.log('Profile loading operation completed');
    }
  }, [loadingOperation])

  useEffect(() => {
    let mounted = true

    const setupAuth = async () => {
      await loadProfile()

      // Set up auth state change listener
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSession(session)
          if (session) loadProfile()
          else setProfile(null)
        }
      })

      return () => {
        mounted = false
        subscription?.subscription?.unsubscribe?.()
      }
    }

    const cleanup = setupAuth()
    return () => {
      cleanup.then(unsub => unsub && unsub())
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }, [])

  const refreshProfile = useCallback(async () => {
    // Only refresh if not already loading
    if (!loadingOperation) {
      console.log('Refreshing user profile...');
      await loadProfile();
    } else {
      console.log('Skipping profile refresh - loading operation in progress');
    }
  }, [loadProfile, loadingOperation]);

  return {
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile
  }
}