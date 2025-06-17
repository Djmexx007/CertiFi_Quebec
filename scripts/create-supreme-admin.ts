/**
 * Script pour créer l'utilisateur Supreme Admin
 * 
 * Ce script peut être exécuté de deux façons :
 * 1. Via l'Edge Function (recommandé en production)
 * 2. Directement avec ce script (pour le développement)
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://odhfxiizydcvlmdfqwwt.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requis')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSupremeAdmin() {
  console.log('🚀 Création du Supreme Admin via script direct...')
  
  try {
    // Appeler l'Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-supreme-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('✅ SUCCESS:', result.message)
      console.log('📊 User ID:', result.user_id)
      console.log('📋 Détails:', result.details)
      
      console.log('\n🔐 Informations de connexion:')
      console.log('  Email: supreme.admin@certifi.quebec')
      console.log('  Primerica ID: SUPREMEADMIN001')
      console.log('  Mot de passe: ChangeMe123!')
      console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!')
      
    } else {
      console.error('❌ ERREUR:', result.message || 'Erreur inconnue')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  }
}

// Exécuter le script
createSupremeAdmin()