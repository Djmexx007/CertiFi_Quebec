import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface AuthModalProps {
  onClose: () => void
  onLoginSuccess: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [showSignup, setShowSignup] = useState(false)

  const navigate = useNavigate()

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  }

  const isPasswordStrong = (pw: string) =>
    pw.length >= 6 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw)

  const isUsernameAvailable = async (usernameToCheck: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', usernameToCheck)
      .maybeSingle()
    return !data
  }

  const isEmailAvailable = async (emailToCheck: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailToCheck)
      .maybeSingle()
    return !data
  }

  const redirectBasedOnRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single()

    if (!user.email_confirmed_at) {
      navigate('/confirm-email')
      return
    }

    if (data?.role === 'admin') {
      toast.success(`Bienvenue ${data.username} 👑`)
      navigate('/admin')
    } else {
      toast.success(`Bienvenue ${data.username} 🎉`)
      onLoginSuccess()
      window.location.reload()
    }
  }

  const handleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Adresse courriel ou mot de passe incorrect.')
      toast.error('Connexion échouée.')
      return
    }

    await redirectBasedOnRole()
  }

  const handleSignup = async () => {
    setError('')

    if (!username || !email || !password || !confirmPassword) {
      setError('Tous les champs obligatoires doivent être remplis.')
      return
    }

    if (!isEmailValid(email)) {
      setError("L'adresse courriel n'est pas valide.")
      return
    }

    if (!isPasswordStrong(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères, avec une majuscule, une minuscule et un chiffre.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const usernameOk = await isUsernameAvailable(username)
    if (!usernameOk) {
      setError('Ce nom d’utilisateur est déjà utilisé.')
      return
    }

    const emailOk = await isEmailAvailable(email)
    if (!emailOk) {
      setError('Ce courriel est déjà associé à un compte.')
      return
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      setError('Erreur lors de la création du compte : ' + authError.message)
      return
    }

    const userId = authData.user?.id
    if (userId) {
      await supabase.from('profiles').insert([
        {
          id: userId,
          username,
          email,
          phone
        }
      ])
    }

    toast.success(`Bienvenue ${username} 🎉`)
    await redirectBasedOnRole()
    setShowSignup(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-zinc-900 text-white p-6 rounded-xl w-full max-w-md shadow-lg border border-emerald-600 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-xl"
        >
          ×
        </button>

        {showSignup ? (
          <>
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Créer un compte</h2>
            <input
              type="text"
              placeholder="Nom d’utilisateur"
              className="w-full p-2 mb-3 rounded text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 mb-3 rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirme le mot de passe"
              className="w-full p-2 mb-3 rounded text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              className="w-full p-2 mb-4 rounded text-black"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowSignup(false)}
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded"
              >
                Retour
              </button>
              <button
                onClick={handleSignup}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Créer un compte
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Connexion / Inscription</h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full p-2 mb-4 rounded text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex justify-between gap-2">
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Créer un compte
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AuthModal
