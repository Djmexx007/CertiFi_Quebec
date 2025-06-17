import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://odhfxiizydcvlmdfqwwt.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY est requis')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const supremeAdminData = {
  email: 'supreme.admin@certifi.quebec',
  password: 'password123', // Mot de passe cohérent avec les autres comptes démo
  primerica_id: 'SUPREMEADMIN001',
  first_name: 'Admin',
  last_name: 'Suprême',
  initial_role: 'LES_DEUX' as const
}

async function createSupremeAdmin() {
  try {
    console.log('🚀 Début de la création du Supreme Admin...')

    let authUserId: string
    let wasExisting = false
    let authCreated = false

    // 1. Vérifier si l'utilisateur existe déjà
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

      // Mettre à jour le mot de passe
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
        throw new Error(`Erreur création Auth: ${authError.message}`)
      }

      authUserId = authData.user.id
      authCreated = true
      console.log('✅ Utilisateur Auth créé:', authUserId)
    }

    // 3. Créer/Mettre à jour le profil
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
      if (authCreated) {
        console.log('🧹 Nettoyage de l\'utilisateur Auth créé...')
        await supabase.auth.admin.deleteUser(authUserId)
      }
      throw new Error(`Erreur création profil: ${profileError.message}`)
    }

    console.log('✅ Profil créé/mis à jour avec succès')

    // 4. Attribuer toutes les permissions
    console.log('🔑 Attribution des permissions...')
    const { data: allPermissions } = await supabase
      .from('permissions')
      .select('id')

    if (allPermissions && allPermissions.length > 0) {
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', authUserId)

      const permissionInserts = allPermissions.map(perm => ({
        user_id: authUserId,
        permission_id: perm.id,
        granted_by: authUserId
      }))

      await supabase
        .from('user_permissions')
        .insert(permissionInserts)

      console.log(`✅ ${allPermissions.length} permissions attribuées`)
    }

    // 5. Logger l'action
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
        ip_address: 'localhost',
        user_agent: 'create-supreme-admin-script'
      })

    // Résultat final
    const result = {
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

    console.log('\n🎉 Supreme Admin configuré avec succès!')
    console.log('📧 Email:', supremeAdminData.email)
    console.log('🆔 Primerica ID:', supremeAdminData.primerica_id)
    console.log('🔑 Mot de passe:', supremeAdminData.password)
    console.log('\n📊 Résultat:', JSON.stringify(result, null, 2))

    return result

  } catch (error) {
    console.error('💥 Erreur fatale:', error)
    throw error
  }
}

// Exécution du script
if (require.main === module) {
  createSupremeAdmin()
    .then(() => {
      console.log('\n✅ Script terminé avec succès')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script échoué:', error.message)
      process.exit(1)
    })
}

export { createSupremeAdmin }