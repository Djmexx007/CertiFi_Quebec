import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateSupremeAdminResponse {
  success: boolean
  user_id?: string
  message: string
  details?: {
    auth_created: boolean
    profile_created: boolean
    permissions_granted: number
    was_existing: boolean
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Utiliser la Service Role Key pour les opérations admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Début de la création du Supreme Admin...')

    // Configuration du Supreme Admin
    const adminConfig = {
      email: 'supreme.admin@certifi.quebec',
      password: 'ChangeMe123!',
      primerica_id: 'SUPREMEADMIN001',
      first_name: 'Admin',
      last_name: 'Suprême',
      initial_role: 'LES_DEUX' as const
    }

    let authCreated = false
    let profileCreated = false
    let wasExisting = false
    let adminUserId: string

    // =====================================================
    // 1. VÉRIFIER SI L'UTILISATEUR EXISTE DÉJÀ
    // =====================================================
    
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...')
    
    // Vérifier dans la table users d'abord
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('id, primerica_id, email, is_admin, is_supreme_admin')
      .eq('primerica_id', adminConfig.primerica_id)
      .maybeSingle()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification du profil:', profileCheckError)
      throw new Error(`Erreur lors de la vérification: ${profileCheckError.message}`)
    }

    if (existingProfile) {
      console.log('👤 Utilisateur existant trouvé:', existingProfile.id)
      adminUserId = existingProfile.id
      wasExisting = true

      // Mettre à jour les permissions admin si nécessaire
      if (!existingProfile.is_admin || !existingProfile.is_supreme_admin) {
        console.log('🔧 Mise à jour des permissions admin...')
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            is_admin: true,
            is_supreme_admin: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', adminUserId)

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour:', updateError)
          throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`)
        }

        console.log('✅ Permissions admin mises à jour')
      }
    } else {
      // =====================================================
      // 2. CRÉER L'UTILISATEUR DANS AUTH
      // =====================================================
      
      console.log('👤 Création de l\'utilisateur dans Supabase Auth...')
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminConfig.email,
        password: adminConfig.password,
        email_confirm: true,
        user_metadata: {
          primerica_id: adminConfig.primerica_id,
          first_name: adminConfig.first_name,
          last_name: adminConfig.last_name,
          initial_role: adminConfig.initial_role,
          is_demo_user: false
        }
      })

      if (authError) {
        console.error('❌ Erreur lors de la création auth:', authError)
        
        // Si l'utilisateur existe déjà dans auth, récupérer son ID
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          console.log('🔍 Utilisateur auth existe déjà, récupération de l\'ID...')
          
          // Essayer de récupérer l'utilisateur par email
          const { data: existingAuthUser, error: getUserError } = await supabase.auth.admin.listUsers()
          
          if (getUserError) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${getUserError.message}`)
          }

          const foundUser = existingAuthUser.users.find(u => u.email === adminConfig.email)
          if (!foundUser) {
            throw new Error('Utilisateur introuvable après vérification d\'existence')
          }

          adminUserId = foundUser.id
          console.log('✅ ID utilisateur auth récupéré:', adminUserId)
        } else {
          throw new Error(`Erreur lors de la création auth: ${authError.message}`)
        }
      } else {
        adminUserId = authData.user.id
        authCreated = true
        console.log('✅ Utilisateur auth créé avec ID:', adminUserId)
      }

      // =====================================================
      // 3. CRÉER LE PROFIL DANS PUBLIC.USERS
      // =====================================================
      
      console.log('📝 Création du profil utilisateur...')
      
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: adminUserId,
          primerica_id: adminConfig.primerica_id,
          email: adminConfig.email,
          first_name: adminConfig.first_name,
          last_name: adminConfig.last_name,
          initial_role: adminConfig.initial_role,
          current_xp: 5000,
          current_level: 8,
          gamified_role: 'Maître Administrateur',
          is_admin: true,
          is_supreme_admin: true,
          is_active: true,
          last_activity_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })

      if (profileError) {
        console.error('❌ Erreur lors de la création du profil:', profileError)
        
        // Nettoyer l'utilisateur auth si la création du profil échoue
        if (authCreated) {
          console.log('🧹 Nettoyage de l\'utilisateur auth...')
          await supabase.auth.admin.deleteUser(adminUserId)
        }
        
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`)
      }

      profileCreated = true
      console.log('✅ Profil utilisateur créé/mis à jour')
    }

    // =====================================================
    // 4. ATTRIBUER TOUTES LES PERMISSIONS
    // =====================================================
    
    console.log('🔑 Attribution des permissions...')
    
    // Récupérer toutes les permissions disponibles
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id, name')

    if (permissionsError) {
      console.error('❌ Erreur lors de la récupération des permissions:', permissionsError)
      throw new Error(`Erreur permissions: ${permissionsError.message}`)
    }

    let permissionsGranted = 0

    if (permissions && permissions.length > 0) {
      // Supprimer les anciennes permissions pour éviter les doublons
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', adminUserId)

      // Attribuer toutes les permissions
      const permissionInserts = permissions.map(permission => ({
        user_id: adminUserId,
        permission_id: permission.id,
        granted_by: adminUserId,
        granted_at: new Date().toISOString()
      }))

      const { error: permissionError } = await supabase
        .from('user_permissions')
        .insert(permissionInserts)

      if (permissionError) {
        console.error('❌ Erreur lors de l\'attribution des permissions:', permissionError)
        // Ne pas faire échouer le processus pour les permissions
        console.log('⚠️ Permissions non attribuées, mais utilisateur créé')
      } else {
        permissionsGranted = permissions.length
        console.log(`✅ ${permissionsGranted} permissions attribuées`)
      }
    } else {
      console.log('⚠️ Aucune permission trouvée dans la base de données')
    }

    // =====================================================
    // 5. LOGGER L'ACTION ADMIN
    // =====================================================
    
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'create_supreme_admin',
          target_entity: 'users',
          target_id: adminUserId,
          details_json: {
            primerica_id: adminConfig.primerica_id,
            email: adminConfig.email,
            auth_created: authCreated,
            profile_created: profileCreated,
            was_existing: wasExisting,
            permissions_granted: permissionsGranted
          },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          occurred_at: new Date().toISOString()
        })
      
      console.log('📝 Action loggée dans admin_logs')
    } catch (logError) {
      console.warn('⚠️ Impossible de logger l\'action:', logError)
      // Ne pas faire échouer le processus pour les logs
    }

    // =====================================================
    // 6. RÉPONSE DE SUCCÈS
    // =====================================================
    
    const response: CreateSupremeAdminResponse = {
      success: true,
      user_id: adminUserId,
      message: wasExisting 
        ? 'Supreme Admin mis à jour avec succès' 
        : 'Supreme Admin créé avec succès',
      details: {
        auth_created: authCreated,
        profile_created: profileCreated,
        permissions_granted: permissionsGranted,
        was_existing: wasExisting
      }
    }

    console.log('🎉 SUCCESS:', response.message)
    console.log('📊 Détails:', response.details)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur fatale:', error)
    
    const errorResponse: CreateSupremeAdminResponse = {
      success: false,
      message: `Erreur lors de la création du Supreme Admin: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})