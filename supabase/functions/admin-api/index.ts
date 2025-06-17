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
          case 'create-user': {
            // NOUVEAU: Endpoint centralisé pour créer des utilisateurs réels
            const body = await req.json()
            const { email, password, primerica_id, first_name, last_name, initial_role } = body
            
            // Validation des données
            if (!email || !password || !primerica_id || !first_name || !last_name || !initial_role) {
              return new Response(
                JSON.stringify({ error: 'Tous les champs sont requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Vérifier si le primerica_id existe déjà
            const { data: existingUser } = await supabase
              .from('users')
              .select('primerica_id')
              .eq('primerica_id', primerica_id)
              .single()

            if (existingUser) {
              return new Response(
                JSON.stringify({ error: 'Ce numéro de représentant est déjà utilisé' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Créer l'utilisateur avec Supabase Auth Admin
            const supabaseAdmin = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
              email: email,
              password: password,
              email_confirm: true,
              user_metadata: {
                primerica_id: primerica_id,
                first_name: first_name,
                last_name: last_name,
                initial_role: initial_role
              }
            })

            if (authError) {
              return new Response(
                JSON.stringify({ error: authError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Créer le profil métier via RPC
            const { error: profileError } = await supabase.rpc(
              'create_user_with_permissions',
              {
                user_id: authData.user.id,
                primerica_id_param: primerica_id,
                email_param: email,
                first_name_param: first_name,
                last_name_param: last_name,
                initial_role_param: initial_role
              }
            )

            if (profileError) {
              // Supprimer l'utilisateur Auth en cas d'erreur
              await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
              return new Response(
                JSON.stringify({ error: 'Erreur lors de la création du profil: ' + profileError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            await logAdminAction('create_user', 'users', authData.user.id, { 
              primerica_id, email, first_name, last_name, initial_role 
            })

            return new Response(
              JSON.stringify({ 
                message: 'Utilisateur créé avec succès',
                user: {
                  id: authData.user.id,
                  email: authData.user.email,
                  primerica_id: primerica_id
                }
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

            const { data: result, error } = await supabase.rpc('award_xp', {
              user_uuid: user_id,
              xp_amount: parseInt(xp_amount),
              activity_type_param: 'admin_award',
              activity_details: {
                reason: reason || 'Attribution manuelle par administrateur',
                admin_id: user.id
              }
            })
            
            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
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
            const supabaseAdmin = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            const { error } = await supabaseAdmin.auth.admin.deleteUser(resourceId)

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