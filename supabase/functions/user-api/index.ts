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

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const endpoint = pathSegments[pathSegments.length - 1]

    switch (req.method) {
      case 'GET': {
        switch (endpoint) {
          case 'profile': {
            const { data: profile, error } = await supabase
              .from('users')
              .select(`
                *,
                user_permissions (
                  permission_id,
                  permissions (name, description)
                )
              `)
              .eq('id', user.id)
              .single()

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Obtenir les statistiques utilisateur
            const { data: statsData } = await supabase.rpc('get_user_stats', { user_uuid: user.id })

            return new Response(
              JSON.stringify({ 
                profile: {
                  ...profile,
                  stats: statsData || {}
                }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'podcasts': {
            const { data: podcasts, error } = await supabase
              .from('podcast_content')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false })

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ podcasts }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'exams': {
            const permission = url.searchParams.get('permission')
            let query = supabase
              .from('exams')
              .select('*')
              .eq('is_active', true)

            if (permission) {
              query = query.eq('required_permission', permission)
            }

            const { data: exams, error } = await query.order('created_at', { ascending: false })

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ exams }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'start-exam': {
            const examId = url.searchParams.get('exam_id')
            if (!examId) {
              return new Response(
                JSON.stringify({ error: 'ID d\'examen requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer la configuration de l'examen
            const { data: exam, error: examError } = await supabase
              .from('exams')
              .select('*')
              .eq('id', examId)
              .eq('is_active', true)
              .single()

            if (examError || !exam) {
              return new Response(
                JSON.stringify({ error: 'Examen introuvable' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Sélectionner les questions aléatoirement
            const { data: questions, error: questionsError } = await supabase
              .from('questions')
              .select('id, question_text, question_type, options_json, difficulty_level')
              .eq('required_permission', exam.required_permission)
              .eq('is_active', true)

            if (questionsError) {
              return new Response(
                JSON.stringify({ error: questionsError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Mélanger et sélectionner le nombre requis de questions
            const shuffledQuestions = questions.sort(() => Math.random() - 0.5)
            const selectedQuestions = shuffledQuestions.slice(0, exam.num_questions_to_draw)

            // Enregistrer le début de l'examen
            await supabase.rpc('award_xp', {
              user_uuid: user.id,
              xp_amount: 0,
              activity_type_param: 'exam_started',
              activity_details: {
                exam_id: examId,
                exam_name: exam.exam_name,
                questions_count: selectedQuestions.length
              }
            })

            return new Response(
              JSON.stringify({
                exam: {
                  id: exam.id,
                  name: exam.exam_name,
                  description: exam.description,
                  time_limit_minutes: exam.time_limit_minutes,
                  passing_score: exam.passing_score_percentage
                },
                questions: selectedQuestions
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'exam-attempts': {
            const { data: attempts, error } = await supabase
              .from('user_exam_attempts')
              .select(`
                *,
                exams (exam_name, required_permission)
              `)
              .eq('user_id', user.id)
              .order('attempt_date', { ascending: false })
              .limit(20)

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ attempts }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'recent-activities': {
            const limit = parseInt(url.searchParams.get('limit') || '20')
            const { data: activities, error } = await supabase
              .from('recent_activities')
              .select('*')
              .eq('user_id', user.id)
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

          case 'minigames': {
            const { data: minigames, error } = await supabase
              .from('minigames')
              .select('*')
              .eq('is_active', true)
              .order('created_at', { ascending: false })

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ minigames }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'leaderboard': {
            const type = url.searchParams.get('type') || 'global'
            const limit = parseInt(url.searchParams.get('limit') || '50')
            
            let query = supabase
              .from('users')
              .select('id, first_name, last_name, current_xp, current_level, gamified_role, initial_role')
              .eq('is_active', true)
              .order('current_xp', { ascending: false })
              .limit(limit)

            if (type === 'pqap') {
              query = query.in('initial_role', ['PQAP', 'LES_DEUX'])
            } else if (type === 'fonds_mutuels') {
              query = query.in('initial_role', ['FONDS_MUTUELS', 'LES_DEUX'])
            }

            const { data: leaderboard, error } = await query

            if (error) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ leaderboard }),
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
        const body = await req.json()

        switch (endpoint) {
          case 'podcast-listened': {
            const { podcast_id } = body
            
            if (!podcast_id) {
              return new Response(
                JSON.stringify({ error: 'ID du podcast requis' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer les infos du podcast
            const { data: podcast, error: podcastError } = await supabase
              .from('podcast_content')
              .select('xp_awarded, title, theme')
              .eq('id', podcast_id)
              .eq('is_active', true)
              .single()

            if (podcastError || !podcast) {
              return new Response(
                JSON.stringify({ error: 'Podcast introuvable' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Attribuer l'XP
            const { data: xpResult, error: xpError } = await supabase.rpc('award_xp', {
              user_uuid: user.id,
              xp_amount: podcast.xp_awarded,
              activity_type_param: 'podcast_listened',
              activity_details: { 
                podcast_id, 
                podcast_title: podcast.title,
                theme: podcast.theme
              }
            })

            if (xpError) {
              return new Response(
                JSON.stringify({ error: xpError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ 
                message: 'XP attribué avec succès',
                xp_gained: podcast.xp_awarded,
                result: xpResult
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'submit-exam': {
            const { exam_id, answers, time_spent_seconds } = body
            
            if (!exam_id || !answers || time_spent_seconds === undefined) {
              return new Response(
                JSON.stringify({ error: 'Données d\'examen incomplètes' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer l'examen et les questions
            const { data: exam, error: examError } = await supabase
              .from('exams')
              .select('*')
              .eq('id', exam_id)
              .single()

            if (examError || !exam) {
              return new Response(
                JSON.stringify({ error: 'Examen introuvable' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer les bonnes réponses pour les questions soumises
            const questionIds = Object.keys(answers)
            const { data: questions, error: questionsError } = await supabase
              .from('questions')
              .select('id, correct_answer_key, difficulty_level')
              .in('id', questionIds)

            if (questionsError) {
              return new Response(
                JSON.stringify({ error: questionsError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Calculer le score
            let correct_answers = 0
            const detailed_answers = questions.map(question => {
              const user_answer = answers[question.id]
              const is_correct = user_answer === question.correct_answer_key
              if (is_correct) correct_answers++
              
              return {
                question_id: question.id,
                user_answer,
                correct_answer: question.correct_answer_key,
                is_correct,
                difficulty: question.difficulty_level
              }
            })

            const score_percentage = (correct_answers / questions.length) * 100

            // Calculer l'XP basé sur la performance
            const { data: calculated_xp } = await supabase.rpc('calculate_exam_xp', {
              base_xp: exam.xp_base_reward,
              score_percentage,
              time_spent_seconds,
              time_limit_seconds: exam.time_limit_minutes * 60
            })

            // Enregistrer la tentative
            const { data: attempt, error: attemptError } = await supabase
              .from('user_exam_attempts')
              .insert({
                user_id: user.id,
                exam_id,
                score_percentage,
                user_answers_json: { answers: detailed_answers },
                time_spent_seconds,
                xp_earned: calculated_xp || 0
              })
              .select()
              .single()

            if (attemptError) {
              return new Response(
                JSON.stringify({ error: attemptError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Attribuer l'XP
            let xpResult = null
            if (calculated_xp > 0) {
              const { data: xpData } = await supabase.rpc('award_xp', {
                user_uuid: user.id,
                xp_amount: calculated_xp,
                activity_type_param: 'exam_completed',
                activity_details: {
                  exam_id,
                  exam_name: exam.exam_name,
                  score_percentage,
                  passed: score_percentage >= exam.passing_score_percentage,
                  time_spent_seconds
                }
              })
              xpResult = xpData
            }

            return new Response(
              JSON.stringify({
                attempt,
                score_percentage,
                passed: score_percentage >= exam.passing_score_percentage,
                xp_earned: calculated_xp || 0,
                detailed_answers,
                xp_result: xpResult
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          case 'submit-minigame-score': {
            const { minigame_id, score, max_possible_score, game_session_data } = body
            
            if (!minigame_id || score === undefined) {
              return new Response(
                JSON.stringify({ error: 'Données de mini-jeu incomplètes' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Récupérer les infos du mini-jeu
            const { data: minigame, error: minigameError } = await supabase
              .from('minigames')
              .select('*')
              .eq('id', minigame_id)
              .eq('is_active', true)
              .single()

            if (minigameError || !minigame) {
              return new Response(
                JSON.stringify({ error: 'Mini-jeu introuvable' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Vérifier la limite quotidienne d'XP pour ce mini-jeu
            const today = new Date().toISOString().split('T')[0]
            const { data: todayScores } = await supabase
              .from('user_minigame_scores')
              .select('xp_earned')
              .eq('user_id', user.id)
              .eq('minigame_id', minigame_id)
              .gte('attempt_date', today + 'T00:00:00Z')
              .lt('attempt_date', today + 'T23:59:59Z')

            const todayXp = todayScores?.reduce((sum, s) => sum + s.xp_earned, 0) || 0
            const remainingXp = Math.max(0, minigame.max_daily_xp - todayXp)
            
            // Calculer l'XP basé sur la performance
            let xp_to_award = minigame.base_xp_gain
            if (max_possible_score && max_possible_score > 0) {
              const performance_ratio = score / max_possible_score
              xp_to_award = Math.round(minigame.base_xp_gain * performance_ratio)
            }
            xp_to_award = Math.min(xp_to_award, remainingXp)

            // Enregistrer le score
            const { data: scoreRecord, error: scoreError } = await supabase
              .from('user_minigame_scores')
              .insert({
                user_id: user.id,
                minigame_id,
                score,
                max_possible_score,
                xp_earned: xp_to_award,
                game_session_data: game_session_data || {}
              })
              .select()
              .single()

            if (scoreError) {
              return new Response(
                JSON.stringify({ error: scoreError.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            // Attribuer l'XP si applicable
            let xpResult = null
            if (xp_to_award > 0) {
              const { data: xpData } = await supabase.rpc('award_xp', {
                user_uuid: user.id,
                xp_amount: xp_to_award,
                activity_type_param: 'minigame_played',
                activity_details: {
                  minigame_id,
                  game_name: minigame.game_name,
                  score,
                  max_possible_score
                }
              })
              xpResult = xpData
            }

            return new Response(
              JSON.stringify({
                score_record: scoreRecord,
                xp_earned: xp_to_award,
                daily_xp_remaining: remainingXp - xp_to_award,
                xp_result: xpResult
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

      default:
        return new Response(
          JSON.stringify({ error: 'Méthode non supportée' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Erreur dans user-api:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})