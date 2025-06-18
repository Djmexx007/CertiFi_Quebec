import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Shield, User, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Auth() {
  const [representantNumber, setRepresentantNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [authAttempts, setAuthAttempts] = useState(0)
  const navigate = useNavigate()

  // Clear any potentially invalid session data on component mount
  useEffect(() => {
    const clearInvalidSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          // Clear any potentially corrupted session data
          localStorage.removeItem('supabase.auth.token')
        }
      } catch (e) {
        console.error('Error checking session:', e)
        localStorage.removeItem('supabase.auth.token')
      }
    }
    
    clearInvalidSession()
  }, [])

  // Add a counter to prevent infinite auth loops
  useEffect(() => {
    if (authAttempts > 5) {
      toast.error("Trop de tentatives de connexion. Veuillez rafraîchir la page.")
      localStorage.removeItem('supabase.auth.token')
    }
  }, [authAttempts])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAuthAttempts(prev => prev + 1)

    try {
      // For this demo, we'll use the representant number as the email
      // In a real implementation, you might want to handle this differently
      const email = `${representantNumber}@certifi.quebec`
      
      if (!representantNumber.trim()) {
        throw new Error("Numéro de représentant requis")
      }

      if (!password) {
        throw new Error("Mot de passe requis")
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas")
        }

        if (password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères")
        }

        if (!username.trim()) {
          throw new Error("Nom d'utilisateur requis")
        }

        // Vérifie si le username est unique
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)

        if (existingUsername && existingUsername.length > 0) {
          throw new Error("Ce nom d'utilisateur est déjà utilisé")
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm-email`
          }
        })

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error("Un compte existe déjà avec ce numéro de représentant")
          }
          throw signUpError
        }

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username,
              role: 'user',
              xp: 0,
              chapters_completed: [],
              representant_number: representantNumber,
              avatar_url: 'https://vmjdzgxrprnhhcffuwmz.supabase.co/storage/v1/object/public/avatars/default-avatar.png'
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            throw new Error("Erreur lors de la création du profil")
          }

          toast.success('Compte créé ! Vérifiez votre boîte mail.')
          navigate('/confirm-email')
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error("Numéro de représentant ou mot de passe incorrect")
          }
          throw signInError
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

          toast.success('Connexion réussie !')
          navigate(profile?.role === 'admin' ? '/admin' : '/')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">CertiFi Québec</h2>
            <p className="text-sm text-gray-500">Formation Primerica</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connexion
        </h2>
        <p className="text-gray-600">
          Accédez à votre formation CertiFi
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de représentant</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={representantNumber}
              onChange={(e) => setRepresentantNumber(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre numéro de représentant"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex. JeanDupont"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Se souvenir de moi
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Se connecter"
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          className="w-full text-sm text-blue-600 hover:text-blue-500 transition-colors"
        >
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
        </button>
      </form>

      {/* Test account info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Compte de test :</h3>
        <div className="text-xs text-gray-600">
          <p><span className="font-medium">Numéro :</span> tulip</p>
          <p><span className="font-medium">Mot de passe :</span> Uzxe912</p>
        </div>
      </div>
    </div>
  )
}