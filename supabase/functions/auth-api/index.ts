import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RegisterRequest {
  email: string
  password: string
  primerica_id: string
  first_name: string
  last_name: string
  initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
}

interface LoginRequest {
  primerica_id: string
  password: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (path) {
      case 'register': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Méthode non autorisée' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body: RegisterRequest = await req.json()
        
        // Validation des données
        if (!body.email || !body.password || !body.primerica_id || !body.first_name || !body.last_name || !body.initial_role) {
          return new Response(
            JSON.stringify({ error: 'Tous les champs sont requis' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Vérifier si le primerica_id existe déjà
        const { data: existingUser } = await supabase
          .from('users')
          .select('primerica_id')
          .eq('primerica_id', body.primerica_id)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'Ce numéro de représentant est déjà utilisé' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Créer l'utilisateur avec Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
          user_metadata: {
            primerica_id: body.primerica_id,
            first_name: body.first_name,
            last_name: body.last_name,
            initial_role: body.initial_role
          }
        })

        if (authError) {
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Créer le profil utilisateur avec permissions
        const { data: profileData, error: profileError } = await supabase.rpc(
          'create_user_with_permissions',
          {
            user_id: authData.user.id,
            primerica_id_param: body.primerica_id,
            email_param: body.email,
            first_name_param: body.first_name,
            last_name_param: body.last_name,
            initial_role_param: body.initial_role
          }
        )

        if (profileError) {
          await supabase.auth.admin.deleteUser(authData.user.id)
          return new Response(
            JSON.stringify({ error: 'Erreur lors de la création du profil: ' + profileError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            message: 'Utilisateur créé avec succès',
            user: {
              id: authData.user.id,
              email: authData.user.email,
              primerica_id: body.primerica_id
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'login': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Méthode non autorisée' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body: LoginRequest = await req.json()
        
        if (!body.primerica_id || !body.password) {
          return new Response(
            JSON.stringify({ error: 'Numéro de représentant et mot de passe requis' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Trouver l'utilisateur par primerica_id
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, email, is_active')
          .eq('primerica_id', body.primerica_id)
          .single()

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Numéro de représentant introuvable' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!user.is_active) {
          return new Response(
            JSON.stringify({ error: 'Compte désactivé. Contactez l\'administrateur.' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Connexion avec email/password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: body.password
        })

        if (signInError) {
          return new Response(
            JSON.stringify({ error: 'Mot de passe incorrect' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Mettre à jour la dernière activité
        await supabase
          .from('users')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', user.id)

        // Enregistrer l'activité de connexion
        await supabase.rpc('award_xp', {
          user_uuid: user.id,
          xp_amount: 0,
          activity_type_param: 'login',
          activity_details: { 
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown'
          }
        })

        return new Response(
          JSON.stringify({ 
            message: 'Connexion réussie',
            session: signInData.session,
            user: signInData.user
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'reset-password': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Méthode non autorisée' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { email } = await req.json()
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email requis' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.get('origin')}/reset-password`
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Email de réinitialisation envoyé' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update-password': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Méthode non autorisée' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'Token d\'authentification requis' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          {
            global: {
              headers: { Authorization: authHeader },
            },
          }
        )

        const { password } = await req.json()
        
        if (!password || password.length < 6) {
          return new Response(
            JSON.stringify({ error: 'Le mot de passe doit contenir au moins 6 caractères' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabaseClient.auth.updateUser({
          password: password
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Mot de passe mis à jour avec succès' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint non trouvé' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Erreur dans auth-api:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})