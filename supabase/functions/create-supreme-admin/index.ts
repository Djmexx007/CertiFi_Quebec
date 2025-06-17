import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Début de la création du Supreme Admin...')

    // Utiliser la Service Role Key pour les opérations admin
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supremeAdminData = {
      email: 'supreme.admin@certifi.quebec',
      password: 'password123', // Mot de passe cohérent avec les autres comptes démo
      primerica_id: 'SUPREMEADMIN001',
      first_name: 'Admin',
      last_name: 'Suprême',
      initial_role: 'LES_DEUX' as const
    }

    let authUserId: string
    let wasExisting = false
    let authCreated = false

    // 1. Vérifier si l'utilisateur existe déjà dans public.users
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, is_supreme_admin')
      .eq('primerica_id', supremeAdminData.primerica_id)
      .single()

    if (existingUser) {
      console.log('👤 Utilisateur existant trouvé:', existingUser.id)
      authUserId = existingUser.id
      wasExisting = true

      // Mettre à jour le mot de passe si nécessaire
      console.log('🔄 Mise à jour du mot de passe...')
      const { error: updatePasswordError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password: supremeAdminData.password }
      )

      if (updatePasswordError) {
        console.warn('⚠️ Erreur lors de la mise à jour du mot de passe:', updatePasswordError.message)
      } else {
        console.log('✅ Mot de passe mis à jour avec succès')
      }
    } else {
      // 2. Créer l'utilisateur dans auth.users
      console.log('➕ Création de l\'utilisateur dans Auth...')
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: supremeAdminData.email,
        password: supremeAdminData.password,
        email_confirm: true,
        user_metadata: {
          primerica_id: supremeAdminData.primerica_id,
          first_name: supremeAdminData.first_name,
          last_name: supremeAdminData.last_name,
          initial_role: supremeAdminData.initial_role,
          is_demo_user: false
        }
      })

      if (authError) {
        console.error('❌ Erreur lors de la création Auth:', authError)
        throw new Error(`Erreur création Auth: ${authError.message}`)
      }

      authUserId = authData.user.id
      authCreated = true
      console.log('✅ Utilisateur Auth créé:', authUserId)
    }

    // 3. Créer/Mettre à jour le profil dans public.users
    console.log('👤 Création/Mise à jour du profil...')
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authUserId,
        primerica_id: supremeAdminData.primerica_id,
        email: supremeAdminData.email,
        first_name: supremeAdminData.first_name,
        last_name: supremeAdminData.last_name,
        initial_role: supremeAdminData.initial_role,
        is_admin: true,
        is_supreme_admin: true,
        is_active: true,
        current_xp: 5000,
        current_level: 8,
        gamified_role: 'Maître Administrateur'
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })

    if (profileError) {
      console.error('❌ Erreur lors de la création du profil:', profileError)
      
      // Nettoyage en cas d'erreur (si on vient de créer l'auth user)
      if (authCreated) {
        console.log('🧹 Nettoyage de l\'utilisateur Auth créé...')
        await supabase.auth.admin.deleteUser(authUserId)
      }
      
      throw new Error(`Erreur création profil: ${profileError.message}`)
    }

    console.log('✅ Profil créé/mis à jour avec succès')

    // 4. Attribuer toutes les permissions disponibles
    console.log('🔑 Attribution des permissions...')
    
    // Récupérer toutes les permissions disponibles
    const { data: allPermissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id')

    if (permissionsError) {
      console.warn('⚠️ Erreur lors de la récupération des permissions:', permissionsError.message)
    } else if (allPermissions && allPermissions.length > 0) {
      // Supprimer les anciennes permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', authUserId)

      // Ajouter toutes les permissions
      const permissionInserts = allPermissions.map(perm => ({
        user_id: authUserId,
        permission_id: perm.id,
        granted_by: authUserId // Auto-attribution
      }))

      const { error: insertPermError } = await supabase
        .from('user_permissions')
        .insert(permissionInserts)

      if (insertPermError) {
        console.warn('⚠️ Erreur lors de l\'attribution des permissions:', insertPermError.message)
      } else {
        console.log(`✅ ${allPermissions.length} permissions attribuées`)
      }
    }

    // 5. Logger l'action admin
    console.log('📝 Enregistrement de l\'action admin...')
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: authUserId,
          action_type: wasExisting ? 'update_supreme_admin' : 'create_supreme_admin',
          target_entity: 'users',
          target_id: authUserId,
          details_json: {
            primerica_id: supremeAdminData.primerica_id,
            email: supremeAdminData.email,
            was_existing: wasExisting,
            auth_created: authCreated
          },
          ip_address: req.headers.get('x-forwarded-for') || 'system',
          user_agent: req.headers.get('user-agent') || 'create-supreme-admin-function'
        })
      console.log('✅ Action loggée avec succès')
    } catch (logError) {
      console.warn('⚠️ Erreur lors du logging:', logError)
    }

    // 6. Réponse de succès
    const response = {
      success: true,
      user_id: authUserId,
      message: wasExisting 
        ? 'Supreme Admin mis à jour avec succès' 
        : 'Supreme Admin créé avec succès',
      details: {
        auth_created: authCreated,
        profile_created: !wasExisting,
        permissions_granted: allPermissions?.length || 0,
        was_existing: wasExisting,
        credentials: {
          email: supremeAdminData.email,
          primerica_id: supremeAdminData.primerica_id,
          password: supremeAdminData.password
        }
      }
    }

    console.log('🎉 Supreme Admin configuré avec succès!')
    console.log('📧 Email:', supremeAdminData.email)
    console.log('🆔 Primerica ID:', supremeAdminData.primerica_id)
    console.log('🔑 Mot de passe:', supremeAdminData.password)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('💥 Erreur fatale:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: {
          timestamp: new Date().toISOString(),
          function: 'create-supreme-admin'
        }
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})