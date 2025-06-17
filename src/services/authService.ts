import { supabase } from '../lib/supabase'

/**
 * Service d'authentification sécurisé en deux étapes
 * 1. Lookup métier (primerica_id -> email, is_active)
 * 2. Authentification Supabase (email + password)
 */
export async function loginWithPrimericaId(primericaId: string, password: string) {
  console.log('🔐 Starting secure login process for:', primericaId);
  
  try {
    // 1️⃣ Lookup métier - Recherche du profil utilisateur
    console.log('📋 Step 1: Looking up user profile...');
    const { data: profile, error: lookupErr } = await supabase
      .from('users')
      .select('email, is_active')
      .eq('primerica_id', primericaId)
      .single()

    if (lookupErr) {
      console.error('❌ Lookup error:', lookupErr);
      throw new Error('Numéro de représentant introuvable')
    }

    if (!profile) {
      console.warn('⚠️ No profile found for primerica_id:', primericaId);
      throw new Error('Numéro de représentant introuvable')
    }

    console.log('✅ Profile found:', { email: profile.email, is_active: profile.is_active });

    // Vérifier si le compte est actif
    if (!profile.is_active) {
      console.warn('⚠️ Account is inactive for:', primericaId);
      throw new Error('Compte inactif. Contactez l\'administrateur.')
    }

    // 2️⃣ Authentification Supabase avec l'email trouvé
    console.log('🔑 Step 2: Authenticating with Supabase...');
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    })

    if (authErr) {
      console.error('❌ Authentication error:', authErr);
      
      // Gestion spécifique des erreurs d'authentification
      if (authErr.status === 500) {
        throw new Error('Erreur interne, réessayez plus tard.')
      }
      
      // Erreurs d'authentification courantes
      if (authErr.message?.includes('Invalid login credentials') || 
          authErr.message?.includes('Email not confirmed') ||
          authErr.message?.includes('Invalid email or password')) {
        throw new Error('Mot de passe incorrect')
      }
      
      // Autres erreurs d'authentification
      throw new Error('Mot de passe incorrect')
    }

    if (!authData.session) {
      console.error('❌ No session created after authentication');
      throw new Error('Erreur lors de la création de la session')
    }

    console.log('✅ Authentication successful, session created');
    
    // Mettre à jour la dernière activité
    try {
      await supabase
        .from('users')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('email', profile.email)
    } catch (updateError) {
      console.warn('⚠️ Failed to update last activity:', updateError);
      // Ne pas faire échouer la connexion pour cette erreur
    }

    return authData.session

  } catch (error) {
    console.error('❌ Login process failed:', error);
    
    // Re-lancer l'erreur avec le message approprié
    if (error instanceof Error) {
      throw error;
    }
    
    // Erreur générique pour les cas non prévus
    throw new Error('Erreur de connexion inattendue');
  }
}

/**
 * Fonction utilitaire pour valider les identifiants avant l'envoi
 */
export function validateLoginCredentials(primericaId: string, password: string): string | null {
  if (!primericaId || !primericaId.trim()) {
    return 'Le numéro de représentant est requis';
  }
  
  if (!password || password.length < 1) {
    return 'Le mot de passe est requis';
  }
  
  if (password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères';
  }
  
  return null; // Pas d'erreur
}

/**
 * Fonction pour gérer la déconnexion
 */
export async function logout() {
  console.log('🚪 Logging out user...');
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Logout error:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
    
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout failed:', error);
    throw error;
  }
}

/**
 * Fonction pour réinitialiser le mot de passe
 */
export async function resetPassword(email: string) {
  console.log('🔄 Initiating password reset for:', email);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error('❌ Password reset error:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
    }
    
    console.log('✅ Password reset email sent');
    return { message: 'Email de réinitialisation envoyé' };
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    throw error;
  }
}

/**
 * Fonction pour mettre à jour le mot de passe
 */
export async function updatePassword(newPassword: string) {
  console.log('🔄 Updating password...');
  
  try {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('❌ Password update error:', error);
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }
    
    console.log('✅ Password updated successfully');
    return { message: 'Mot de passe mis à jour avec succès' };
  } catch (error) {
    console.error('❌ Password update failed:', error);
    throw error;
  }
}