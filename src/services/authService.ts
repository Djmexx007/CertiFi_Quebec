import { supabase } from '../lib/supabase'

export async function loginWithPrimericaId(primericaId: string, password: string) {
  // 1️⃣ lookup email & is_active
  const { data: profile, error: lookupErr } = await supabase
    .from('users')
    .select('email, is_active')
    .eq('primerica_id', primericaId)
    .single()
    
  if (lookupErr || !profile) {
    throw new Error('Numéro de représentant introuvable')
  }
  
  if (!profile.is_active) {
    throw new Error('Compte inactif')
  }

  // 2️⃣ appel Auth
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password
  })
  
  if (authErr) {
    if (authErr.status === 500) {
      throw new Error('Erreur interne, réessayer plus tard')
    }
    throw new Error('Mot de passe incorrect')
  }
  
  return authData.session
}