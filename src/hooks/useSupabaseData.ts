import { useState, useEffect, useCallback } from 'react'
import { SupabaseAPI, type User, type Podcast, type Exam, type ExamAttempt, type Minigame, type Activity } from '../lib/supabase'

// Hook pour les données utilisateur
export const useUserData = () => {
  const [profile, setProfile] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const { profile: userProfile } = await SupabaseAPI.getUserProfile()
      setProfile(userProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadActivities = useCallback(async (limit = 20) => {
    try {
      const { activities: userActivities } = await SupabaseAPI.getRecentActivities(limit)
      setActivities(userActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des activités')
    }
  }, [])

  const loadExamAttempts = useCallback(async () => {
    try {
      const { attempts } = await SupabaseAPI.getExamAttempts()
      setExamAttempts(attempts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tentatives d\'examen')
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadActivities()
    loadExamAttempts()
  }, [loadProfile, loadActivities, loadExamAttempts])

  return {
    profile,
    activities,
    examAttempts,
    isLoading,
    error,
    refreshProfile: loadProfile,
    refreshActivities: loadActivities,
    refreshExamAttempts: loadExamAttempts
  }
}

// Hook pour les podcasts
export const usePodcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPodcasts = useCallback(async () => {
    try {
      setIsLoading(true)
      const { podcasts: podcastList } = await SupabaseAPI.getPodcasts()
      setPodcasts(podcastList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des podcasts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsListened = useCallback(async (podcastId: string) => {
    try {
      const result = await SupabaseAPI.markPodcastListened(podcastId)
      if (result.error) throw new Error(result.error)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'écoute')
      throw err
    }
  }, [])

  useEffect(() => {
    loadPodcasts()
  }, [loadPodcasts])

  return {
    podcasts,
    isLoading,
    error,
    markAsListened,
    refreshPodcasts: loadPodcasts
  }
}

// Hook pour les examens
export const useExams = (permission?: string) => {
  const [exams, setExams] = useState<Exam[]>([])
  const [currentExam, setCurrentExam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadExams = useCallback(async () => {
    try {
      setIsLoading(true)
      const { exams: examList } = await SupabaseAPI.getExams(permission)
      setExams(examList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des examens')
    } finally {
      setIsLoading(false)
    }
  }, [permission])

  const startExam = useCallback(async (examId: string) => {
    try {
      setIsLoading(true)
      const examData = await SupabaseAPI.startExam(examId)
      if (examData.error) throw new Error(examData.error)
      setCurrentExam(examData)
      return examData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du démarrage de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitExam = useCallback(async (examId: string, answers: Record<string, string>, timeSpent: number) => {
    try {
      setIsLoading(true)
      const result = await SupabaseAPI.submitExam(examId, answers, timeSpent)
      if (result.error) throw new Error(result.error)
      setCurrentExam(null)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission de l\'examen')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExams()
  }, [loadExams])

  return {
    exams,
    currentExam,
    isLoading,
    error,
    startExam,
    submitExam,
    refreshExams: loadExams,
    clearCurrentExam: () => setCurrentExam(null)
  }
}

// Hook pour les mini-jeux
export const useMinigames = () => {
  const [minigames, setMinigames] = useState<Minigame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMinigames = useCallback(async () => {
    try {
      setIsLoading(true)
      const { minigames: gameList } = await SupabaseAPI.getMinigames()
      setMinigames(gameList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des mini-jeux')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitScore = useCallback(async (data: {
    minigame_id: string
    score: number
    max_possible_score?: number
    game_session_data?: any
  }) => {
    try {
      const result = await SupabaseAPI.submitMinigameScore(data)
      if (result.error) throw new Error(result.error)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du score')
      throw err
    }
  }, [])

  useEffect(() => {
    loadMinigames()
  }, [loadMinigames])

  return {
    minigames,
    isLoading,
    error,
    submitScore,
    refreshMinigames: loadMinigames
  }
}

// Hook pour le classement
export const useLeaderboard = (type: 'global' | 'pqap' | 'fonds_mutuels' = 'global') => {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const { leaderboard: rankings } = await SupabaseAPI.getLeaderboard(type)
      setLeaderboard(rankings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du classement')
    } finally {
      setIsLoading(false)
    }
  }, [type])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  return {
    leaderboard,
    isLoading,
    error,
    refreshLeaderboard: loadLeaderboard
  }
}

// Hook pour les données admin
export const useAdminData = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [globalActivities, setGlobalActivities] = useState<Activity[]>([])
  const [adminLogs, setAdminLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await SupabaseAPI.getDashboardStats()
      if (stats.error) throw new Error(stats.error)
      setDashboardStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques')
    }
  }, [])

  const loadUsers = useCallback(async (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}) => {
    try {
      setIsLoading(true)
      const result = await SupabaseAPI.getUsers(params)
      if (result.error) throw new Error(result.error)
      setUsers(result.users)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadGlobalActivities = useCallback(async (limit = 50) => {
    try {
      const { activities } = await SupabaseAPI.getGlobalActivities(limit)
      setGlobalActivities(activities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des activités globales')
    }
  }, [])

  const loadAdminLogs = useCallback(async (params: {
    page?: number
    limit?: number
  } = {}) => {
    try {
      const result = await SupabaseAPI.getAdminLogs(params)
      if (result.error) throw new Error(result.error)
      setAdminLogs(result.logs)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des logs admin')
      throw err
    }
  }, [])

  const updateUserPermissions = useCallback(async (userId: string, data: {
    permissions?: number[]
    is_admin?: boolean
    is_supreme_admin?: boolean
  }) => {
    try {
      const result = await SupabaseAPI.updateUserPermissions(userId, data)
      if (result.error) throw new Error(result.error)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des permissions')
      throw err
    }
  }, [])

  const awardXP = useCallback(async (userId: string, xpAmount: number, reason?: string) => {
    try {
      const result = await SupabaseAPI.awardXP(userId, xpAmount, reason)
      if (result.error) throw new Error(result.error)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'attribution d\'XP')
      throw err
    }
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const result = await SupabaseAPI.deleteUser(userId)
      if (result.error) throw new Error(result.error)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur')
      throw err
    }
  }, [])

  useEffect(() => {
    loadDashboardStats()
    loadGlobalActivities()
  }, [loadDashboardStats, loadGlobalActivities])

  return {
    dashboardStats,
    users,
    globalActivities,
    adminLogs,
    isLoading,
    error,
    loadUsers,
    loadAdminLogs,
    updateUserPermissions,
    awardXP,
    deleteUser,
    refreshDashboardStats: loadDashboardStats,
    refreshGlobalActivities: loadGlobalActivities
  }
}