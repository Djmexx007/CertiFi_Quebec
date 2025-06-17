import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier les permissions admin
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('is_admin, is_supreme_admin')
      .eq('id', user.id)
      .single()

    if (adminError || (!adminUser.is_admin && !adminUser.is_supreme_admin)) {
      return new Response(
        JSON.stringify({ error: 'Accès non autorisé - Droits administrateur requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const endpoint = pathSegments[pathSegments.length - 1]
    const resourceId = pathSegments[pathSegments.length - 2]

    // Fonction utilitaire pour logger les actions admin
    const logAdminAction = async (action: string, target_entity?: string, target_id?: string, details?: any) => {
      try {
        await supabase.rpc('log_admin_action', {
          admin_id: user.id,
          action_type_param: action,
          target_entity_param: target_entity,
          target_id_param: target_id,
          details_param: details || {},
          ip_address_param: req.headers.get('x-forwarded-for'),
          user_agent_param: req.headers.get('user-agent')
        })
      } catch (logError) {
        console.warn('Failed to log admin action:', logError)
      }
    }

    switch (req.method) {
      case 'GET': {
        switch (endpoint) {
          case 'dashboard-stats': {
            // Statistiques globales pour le tableau de bord admin
            const [
              { count: totalUsers },
              { count: activeUsers },
              { count: totalExamAttempts },
              { count: totalPodcastListens },
              { data: roleDistribution }
            ] = await Promise.all([
              supabase.from('users').select('*', { count: 'exact', head: true }),
              supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
              supabase.from('user_exam_attempts').select('*', { count: 'exact', head: true }),
              supabase.from('recent_activities').select('*', { count: 'exact', head: true }).eq('activity_type', 'podcast_listened'),
              supabase.from('users').select('initial_role').eq('is_active', true)
            ])

            const roleStats = roleDistribution?.reduce((acc: any, user: any) => {
              acc[user.initial_role] = (acc[user.initial_role] || 0) + 1
              return acc
            }, {}) || {}

            // Statistiques XP moyennes par niveau
            const { data: xpStats } = await supabase
              .from('users')
              .select('current_level, current_xp')
              .eq('is_active', true)

            const levelStats = xpStats?.reduce((acc: any, user: any) => {
              if (!acc[user.current_level]) {
                acc[user.current_level] = { count: 0, totalXp: 0 }
              }
              acc[user.current_level].count++
              acc[user.current_level].totalXp += user.current_xp
              return acc
            }, {}) || {}

            Object.keys(levelStats).forEach(level => {
              levelStats[level].avgXp = Math.round(levelStats[level].totalXp / levelStats[level].count)
            })

            return new Response(
              JSON.stringify({
                totalUsers: totalUsers || 0,
                activeUsers: activeUsers || 0,
                totalExamAttempts: totalExamAttempts || 0,
                totalPodcastListens: totalPodcastListens || 0,
                roleDistribution: roleStats,
                levelDistribution: levelStats
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'users': {
            const page = parseInt(url.searchParams.get('page') || '1')
            const limit = parseInt(url.searchParams.get('limit') || '20')
            const search = url.searchParams.get('search')
            const role = url.searchParams.get('role')
            const offset = (page - 1) * limit

            let query = supabase
              .from('users')
              .select(`
                *,
                user_permissions (
                  permission_id,
                  permissions (name, description)
                )
              `, { count: 'exact' })
              .order('created_at', { ascending: false })
              .range(offset, offset + limit - 1)

            if (search) {
              query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,primerica_id.ilike.%${search}%,email.ilike.%${search}%`)
            }

            if (role) {
              query = query.eq('initial_role', role)
            }

            const { data: users, error, count } = await query

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({
                users,
                pagination: {
                  page,
                  limit,
                  total: count || 0,
                  totalPages: Math.ceil((count || 0) / limit)
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'user': {
            if (!resourceId) {
              return new Response(
                JSON.stringify({ error: 'ID utilisateur requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            const { data: userData, error } = await supabase
              .from('users')
              .select(`
                *,
                user_permissions (
                  permission_id,
                  permissions (name, description)
                )
              `)
              .eq('id', resourceId)
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Obtenir les statistiques de l'utilisateur
            let userStats = null
            try {
              const { data } = await supabase.rpc('get_user_stats', { user_uuid: resourceId })
              userStats = data
            } catch (statsError) {
              console.warn('Stats function not available:', statsError)
              userStats = {}
            }

            // Obtenir les activités récentes
            const { data: recentActivities } = await supabase
              .from('recent_activities')
              .select('*')
              .eq('user_id', resourceId)
              .order('occurred_at', { ascending: false })
              .limit(10)

            return new Response(
              JSON.stringify({
                user: userData,
                stats: userStats || {},
                recentActivities: recentActivities || []
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'content': {
            const contentType = url.searchParams.get('type') // 'podcasts', 'questions', 'exams', 'minigames'
            const page = parseInt(url.searchParams.get('page') || '1')
            const limit = parseInt(url.searchParams.get('limit') || '20')
            const offset = (page - 1) * limit

            let tableName = 'podcast_content'
            switch (contentType) {
              case 'questions':
                tableName = 'questions'
                break
              case 'exams':
                tableName = 'exams'
                break
              case 'minigames':
                tableName = 'minigames'
                break
              default:
                tableName = 'podcast_content'
            }

            const { data: content, error, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .order('created_at', { ascending: false })
              .range(offset, offset + limit - 1)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({
                content,
                pagination: {
                  page,
                  limit,
                  total: count || 0,
                  totalPages: Math.ceil((count || 0) / limit)
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'global-activities': {
            const limit = parseInt(url.searchParams.get('limit') || '50')
            const { data: activities, error } = await supabase
              .from('recent_activities')
              .select(`
                *,
                users (first_name, last_name, primerica_id)
              `)
              .order('occurred_at', { ascending: false })
              .limit(limit)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ activities }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'admin-logs': {
            const page = parseInt(url.searchParams.get('page') || '1')
            const limit = parseInt(url.searchParams.get('limit') || '50')
            const offset = (page - 1) * limit

            const { data: logs, error, count } = await supabase
              .from('admin_logs')
              .select(`
                *,
                users (first_name, last_name, primerica_id)
              `, { count: 'exact' })
              .order('occurred_at', { ascending: false })
              .range(offset, offset + limit - 1)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({
                logs,
                pagination: {
                  page,
                  limit,
                  total: count || 0,
                  totalPages: Math.ceil((count || 0) / limit)
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          default:
            return new Response(
              JSON.stringify({ error: 'Endpoint non trouvé' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
      }

      case 'POST': {
        switch (endpoint) {
          case 'create-demo-users': {
            // Créer les utilisateurs de démonstration
            const demoUsers = [
              {
                primerica_id: 'SUPREMEADMIN001',
                email: 'supreme.admin@certifi.quebec',
                first_name: 'Admin',
                last_name: 'Suprême',
                initial_role: 'LES_DEUX',
                is_admin: true,
                is_supreme_admin: true,
                current_xp: 5000,
                current_level: 8,
                gamified_role: 'Maître Administrateur'
              },
              {
                primerica_id: 'REGULARADMIN001',
                email: 'admin@certifi.quebec',
                first_name: 'Admin',
                last_name: 'Régulier',
                initial_role: 'LES_DEUX',
                is_admin: true,
                is_supreme_admin: false,
                current_xp: 3500,
                current_level: 6,
                gamified_role: 'Conseiller Expert'
              },
              {
                primerica_id: 'PQAPUSER001',
                email: 'pqap.user@certifi.quebec',
                first_name: 'Jean',
                last_name: 'Dupont',
                initial_role: 'PQAP',
                current_xp: 2750,
                current_level: 4,
                gamified_role: 'Conseiller Débutant'
              },
              {
                primerica_id: 'FONDSUSER001',
                email: 'fonds.user@certifi.quebec',
                first_name: 'Marie',
                last_name: 'Tremblay',
                initial_role: 'FONDS_MUTUELS',
                current_xp: 4200,
                current_level: 7,
                gamified_role: 'Conseiller Expert'
              },
              {
                primerica_id: 'BOTHUSER001',
                email: 'both.user@certifi.quebec',
                first_name: 'Pierre',
                last_name: 'Bouchard',
                initial_role: 'LES_DEUX',
                current_xp: 6800,
                current_level: 9,
                gamified_role: 'Conseiller Maître'
              }
            ]

            let created = 0
            const errors = []

            for (const demoUser of demoUsers) {
              try {
                // Vérifier si l'utilisateur existe déjà
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('id')
                  .eq('primerica_id', demoUser.primerica_id)
                  .single()

                if (existingUser) {
                  console.log(`User ${demoUser.primerica_id} already exists, skipping...`)
                  continue
                }

                // Créer l'utilisateur avec Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                  email: demoUser.email,
                  password: 'password123',
                  email_confirm: true,
                  user_metadata: {
                    primerica_id: demoUser.primerica_id,
                    first_name: demoUser.first_name,
                    last_name: demoUser.last_name,
                    initial_role: demoUser.initial_role,
                    is_demo_user: true
                  }
                })

                if (authError) {
                  console.error(`Auth error for ${demoUser.primerica_id}:`, authError)
                  errors.push(`${demoUser.primerica_id}: ${authError.message}`)
                  continue
                }

                // Créer le profil utilisateur directement dans la table users
                const { error: profileError } = await supabase
                  .from('users')
                  .insert({
                    id: authData.user.id,
                    primerica_id: demoUser.primerica_id,
                    email: demoUser.email,
                    first_name: demoUser.first_name,
                    last_name: demoUser.last_name,
                    initial_role: demoUser.initial_role,
                    current_xp: demoUser.current_xp || 0,
                    current_level: demoUser.current_level || 1,
                    gamified_role: demoUser.gamified_role || 'Apprenti Conseiller',
                    is_admin: demoUser.is_admin || false,
                    is_supreme_admin: demoUser.is_supreme_admin || false,
                    is_active: true
                  })

                if (profileError) {
                  console.error(`Profile error for ${demoUser.primerica_id}:`, profileError)
                  // Nettoyer l'utilisateur auth si la création du profil échoue
                  await supabase.auth.admin.deleteUser(authData.user.id)
                  errors.push(`${demoUser.primerica_id}: ${profileError.message}`)
                  continue
                }

                // Attribuer les permissions de base selon le rôle
                const permissionsToGrant = []
                switch (demoUser.initial_role) {
                  case 'PQAP':
                    permissionsToGrant.push('pqap')
                    break
                  case 'FONDS_MUTUELS':
                    permissionsToGrant.push('fonds_mutuels')
                    break
                  case 'LES_DEUX':
                    permissionsToGrant.push('pqap', 'fonds_mutuels')
                    break
                }

                // Obtenir les IDs des permissions
                const { data: permissions } = await supabase
                  .from('permissions')
                  .select('id, name')
                  .in('name', permissionsToGrant)

                if (permissions && permissions.length > 0) {
                  const permissionInserts = permissions.map(perm => ({
                    user_id: authData.user.id,
                    permission_id: perm.id,
                    granted_by: user.id
                  }))

                  await supabase
                    .from('user_permissions')
                    .insert(permissionInserts)
                }

                console.log(`Successfully created demo user: ${demoUser.primerica_id}`)
                created++
              } catch (error) {
                console.error(`Unexpected error for ${demoUser.primerica_id}:`, error)
                errors.push(`${demoUser.primerica_id}: ${error.message}`)
              }
            }

            await logAdminAction('create_demo_users', 'users', null, { created, errors })

            return new Response(
              JSON.stringify({
                success: true,
                message: `${created} utilisateurs de démonstration créés avec succès`,
                created,
                errors: errors.length > 0 ? errors : undefined
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'toggle-demo-users': {
            const body = await req.json()
            const { activate } = body
            
            // Mettre à jour tous les utilisateurs de démonstration
            const { data: updatedUsers, error } = await supabase
              .from('users')
              .update({ is_active: activate })
              .in('primerica_id', ['SUPREMEADMIN001', 'REGULARADMIN001', 'PQAPUSER001', 'FONDSUSER001', 'BOTHUSER001'])
              .select('id')

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('toggle_demo_users', 'users', null, { activate, count: updatedUsers?.length || 0 })

            return new Response(
              JSON.stringify({
                success: true,
                message: `Utilisateurs de démonstration ${activate ? 'activés' : 'désactivés'}`,
                count: updatedUsers?.length || 0
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'create-content': {
            const body = await req.json()
            const { type, data } = body
            
            if (!type || !data) {
              return new Response(
                JSON.stringify({ error: 'Type et données requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            let tableName = 'podcast_content'
            switch (type) {
              case 'question':
                tableName = 'questions'
                break
              case 'exam':
                tableName = 'exams'
                break
              case 'minigame':
                tableName = 'minigames'
                break
              case 'podcast':
              default:
                tableName = 'podcast_content'
            }

            const { data: newContent, error } = await supabase
              .from(tableName)
              .insert(data)
              .select()
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('create_content', tableName, newContent.id, { type, data })

            return new Response(
              JSON.stringify({ content: newContent }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'award-xp': {
            const body = await req.json()
            const { user_id, xp_amount, reason } = body
            
            if (!user_id || !xp_amount) {
              return new Response(
                JSON.stringify({ error: 'ID utilisateur et montant XP requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            let result = null
            try {
              const { data, error } = await supabase.rpc('award_xp', {
                user_uuid: user_id,
                xp_amount: parseInt(xp_amount),
                activity_type_param: 'admin_award',
                activity_details: {
                  reason: reason || 'Attribution manuelle par administrateur',
                  admin_id: user.id
                }
              })
              
              if (error) throw error
              result = data
            } catch (rpcError) {
              console.warn('RPC function not available, using direct update:', rpcError)
              
              // Fallback: mise à jour directe
              const { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('current_xp, current_level')
                .eq('id', user_id)
                .single()

              if (fetchError) {
                return new Response(
                  JSON.stringify({ error: fetchError.message }),
                  { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
              }

              const newXp = userData.current_xp + parseInt(xp_amount)
              const { error: updateError } = await supabase
                .from('users')
                .update({ current_xp: newXp })
                .eq('id', user_id)

              if (updateError) {
                return new Response(
                  JSON.stringify({ error: updateError.message }),
                  { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
              }

              result = { xp_awarded: parseInt(xp_amount), new_xp: newXp }
            }

            await logAdminAction('award_xp', 'users', user_id, { xp_amount, reason })

            return new Response(
              JSON.stringify({ result }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          default:
            return new Response(
              JSON.stringify({ error: 'Endpoint non trouvé' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
      }

      case 'PUT': {
        const body = await req.json()

        switch (endpoint) {
          case 'user-permissions': {
            if (!resourceId) {
              return new Response(
                JSON.stringify({ error: 'ID utilisateur requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            const { permissions, is_admin, is_supreme_admin } = body

            // Seul un admin suprême peut modifier les rôles admin
            if ((is_admin !== undefined || is_supreme_admin !== undefined) && !adminUser.is_supreme_admin) {
              return new Response(
                JSON.stringify({ error: 'Seul un administrateur suprême peut modifier les rôles administrateur' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Mettre à jour les flags admin si fournis
            if (is_admin !== undefined || is_supreme_admin !== undefined) {
              const updateData: any = {}
              if (is_admin !== undefined) updateData.is_admin = is_admin
              if (is_supreme_admin !== undefined) updateData.is_supreme_admin = is_supreme_admin

              const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', resourceId)

              if (updateError) {
                return new Response(
                  JSON.stringify({ error: updateError.message }),
                  { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
              }
            }

            // Mettre à jour les permissions si fournies
            if (permissions && Array.isArray(permissions)) {
              // Supprimer les anciennes permissions
              await supabase
                .from('user_permissions')
                .delete()
                .eq('user_id', resourceId)

              // Ajouter les nouvelles permissions
              if (permissions.length > 0) {
                const permissionInserts = permissions.map(permId => ({
                  user_id: resourceId,
                  permission_id: permId,
                  granted_by: user.id
                }))

                const { error: permError } = await supabase
                  .from('user_permissions')
                  .insert(permissionInserts)

                if (permError) {
                  return new Response(
                    JSON.stringify({ error: permError.message }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
                }
              }
            }

            await logAdminAction('update_user_permissions', 'users', resourceId, { permissions, is_admin, is_supreme_admin })

            return new Response(
              JSON.stringify({ message: 'Permissions mises à jour avec succès' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'update-content': {
            const { type, id, data } = body
            
            if (!type || !id || !data) {
              return new Response(
                JSON.stringify({ error: 'Type, ID et données requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            let tableName = 'podcast_content'
            switch (type) {
              case 'question':
                tableName = 'questions'
                break
              case 'exam':
                tableName = 'exams'
                break
              case 'minigame':
                tableName = 'minigames'
                break
              case 'podcast':
              default:
                tableName = 'podcast_content'
            }

            const { data: updatedContent, error } = await supabase
              .from(tableName)
              .update(data)
              .eq('id', id)
              .select()
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('update_content', tableName, id, { type, data })

            return new Response(
              JSON.stringify({ content: updatedContent }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          default:
            return new Response(
              JSON.stringify({ error: 'Endpoint non trouvé' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
      }

      case 'DELETE': {
        switch (endpoint) {
          case 'user': {
            if (!resourceId) {
              return new Response(
                JSON.stringify({ error: 'ID utilisateur requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Seul un admin suprême peut supprimer des utilisateurs
            if (!adminUser.is_supreme_admin) {
              return new Response(
                JSON.stringify({ error: 'Seul un administrateur suprême peut supprimer des utilisateurs' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer les infos de l'utilisateur avant suppression
            const { data: userToDelete } = await supabase
              .from('users')
              .select('primerica_id, first_name, last_name')
              .eq('id', resourceId)
              .single()

            // Supprimer l'utilisateur (cascade supprimera les données liées)
            const { error } = await supabase.auth.admin.deleteUser(resourceId)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('delete_user', 'users', resourceId, userToDelete)

            return new Response(
              JSON.stringify({ message: 'Utilisateur supprimé avec succès' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'content': {
            const body = await req.json()
            const { type, id } = body
            
            if (!type || !id) {
              return new Response(
                JSON.stringify({ error: 'Type et ID requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            let tableName = 'podcast_content'
            switch (type) {
              case 'question':
                tableName = 'questions'
                break
              case 'exam':
                tableName = 'exams'
                break
              case 'minigame':
                tableName = 'minigames'
                break
              case 'podcast':
              default:
                tableName = 'podcast_content'
            }

            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq('id', id)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('delete_content', tableName, id, { type })

            return new Response(
              JSON.stringify({ message: 'Contenu supprimé avec succès' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          default:
            return new Response(
              JSON.stringify({ error: 'Endpoint non trouvé' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Méthode non supportée' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Erreur dans admin-api:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})