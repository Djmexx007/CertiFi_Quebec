import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SignUpRequest {
  email: string
  password: string
  primerica_id: string
  first_name: string
  last_name: string
  initial_role: 'PQAP' | 'FONDS_MUTUELS' | 'LES_DEUX'
}

interface SignInRequest {
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
      case 'signup': {
        const body: SignUpRequest = await req.json()
        
        // Vérifier si le primerica_id existe déjà
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('primerica_id')
          .eq('primerica_id', body.primerica_id)
          .single()

        if (existingProfile) {
          return new Response(
            JSON.stringify({ error: 'Ce numéro de représentant est déjà utilisé' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Créer l'utilisateur avec metadata
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: body.email,
          password: body.password,
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

        return new Response(
          JSON.stringify({ 
            message: 'Utilisateur créé avec succès',
            user: authData.user 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'signin': {
        const body: SignInRequest = await req.json()
        
        // Trouver l'utilisateur par primerica_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, primerica_id')
          .eq('primerica_id', body.primerica_id)
          .single()

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ error: 'Numéro de représentant introuvable' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Obtenir l'email de l'utilisateur
        const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(profile.id)
        
        if (authUserError || !authUser.user) {
          return new Response(
            JSON.stringify({ error: 'Utilisateur introuvable' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Connexion avec email/password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: authUser.user.email!,
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
          .from('profiles')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', profile.id)

        // Enregistrer l'activité de connexion
        await supabase
          .from('recent_activities')
          .insert({
            user_id: profile.id,
            activity_type: 'login',
            activity_details_json: { ip: req.headers.get('x-forwarded-for') || 'unknown' }
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

      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint non trouvé' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})