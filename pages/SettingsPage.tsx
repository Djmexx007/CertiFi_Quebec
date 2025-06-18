import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2, Camera } from 'lucide-react'

const DEFAULT_AVATAR = 'https://vmjdzgxrprnhhcffuwmz.supabase.co/storage/v1/object/public/avatars/default-avatar.png'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) return navigate('/')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        toast.error("Erreur chargement du profil")
        return
      }

      setProfile(data)
      setUsername(data.username || '')
      setAvatarUrl(data.avatar_url || DEFAULT_AVATAR)
      setXp(data.xp ?? 0)
      setLevel(Math.floor((data.xp ?? 0) / 100) + 1)
      setEmail(user.email)
      setLoading(false)
    }

    fetchProfile()
  }, [navigate])

  const handleSave = async () => {
    setLoading(true)

    if (!username.trim()) {
      toast.error("Le nom d'utilisateur est requis")
      return setLoading(false)
    }

    if (!/^[a-z0-9._-]{3,20}$/i.test(username.trim())) {
      toast.error("3-20 caractères, lettres, chiffres, . _ - autorisés")
      return setLoading(false)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Format d'email invalide")
      return setLoading(false)
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("Mot de passe trop court (6 caractères minimum)")
      return setLoading(false)
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (!user || userErr) {
      toast.error("Impossible de récupérer l'utilisateur")
      return setLoading(false)
    }

    // Vérifie si le username est déjà pris
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .neq('id', user.id)

    if (existing && existing.length > 0) {
      toast.error("Nom d'utilisateur déjà utilisé")
      return setLoading(false)
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: username.trim().toLowerCase(), avatar_url: avatarUrl })
      .eq('id', user.id)

    if (email !== user.email) {
      const { error: emailErr } = await supabase.auth.updateUser({ email })
      if (emailErr) toast.error("Erreur mise à jour du courriel")
    }

    if (newPassword) {
      const { error: passErr } = await supabase.auth.updateUser({ password: newPassword })
      if (passErr) toast.error("Erreur mise à jour du mot de passe")
    }

    if (!updateError) toast.success("Profil mis à jour !")
    else toast.error("Erreur mise à jour")

    setLoading(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      toast.error("Erreur lors de l'upload de l'image")
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    if (!data?.publicUrl) {
      toast.error("Impossible de récupérer l'URL de l'image")
      return
    }

    const oldUrl = avatarUrl
    const isCustomAvatar = oldUrl && !oldUrl.includes('default-avatar.png')
    if (isCustomAvatar) {
      const parts = oldUrl.split('/')
      const filename = parts.slice(parts.indexOf('avatars') + 1).join('/')
      await supabase.storage.from('avatars').remove([filename])
    }

    setAvatarUrl(data.publicUrl)
    toast.success("Photo mise à jour !")
  }

  function UsernameModal({ userId, onComplete }: { userId: string, onComplete: () => void }) {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const save = async () => {
      const trimmed = name.trim().toLowerCase()

      if (!trimmed) return setError("Nom requis")

      if (!/^[a-z0-9._-]{3,20}$/.test(trimmed)) {
        setError("3-20 caractères, lettres, chiffres, . _ - autorisés")
        return
      }

      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .neq('id', userId)

      if (fetchError) {
        toast.error("Erreur lors de la vérification")
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        setError("Nom déjà pris")
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: trimmed })
        .eq('id', userId)

      if (updateError) {
        toast.error("Erreur mise à jour")
        setLoading(false)
        return
      }

      setUsername(trimmed)
      toast.success("Nom défini !")
      onComplete()
    }

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-zinc-900 p-6 rounded-xl border border-emerald-600 w-full max-w-md">
          <h2 className="text-lg font-bold mb-4 text-white">Choisis un nom d'utilisateur</h2>
          <input
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ton pseudo unique"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <button
            onClick={save}
            disabled={loading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
          >
            {loading ? 'Chargement...' : 'Valider'}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-gray-900 text-white px-4 py-12">
      {!username && profile?.id && (
        <UsernameModal userId={profile.id} onComplete={() => {}} />
      )}

      <div className="max-w-xl mx-auto bg-zinc-900/80 p-6 rounded-2xl shadow-xl border border-emerald-700">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-emerald-400 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-emerald-300 mb-6">Paramètres du compte</h1>

        <div className="flex flex-col items-center mb-6 relative group">
          <img
            src={avatarUrl || DEFAULT_AVATAR}
            className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
            alt="Avatar"
          />
          <label className="absolute bottom-0 right-0 bg-emerald-700 p-1 rounded-full cursor-pointer group-hover:opacity-100 opacity-0 transition">
            <Camera className="w-4 h-4 text-white" />
            <input
              type="file"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="mb-6 flex items-center justify-between bg-emerald-900/40 p-4 rounded-lg">
          <span className="font-medium">Niveau {level}</span>
          <span className="text-sm text-emerald-200">{xp} XP</span>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium block mb-1">Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Adresse courriel</label>
            <input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Nouveau mot de passe</label>
            <input
              value={newPassword}
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Laisser vide si inchangé"
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-medium transition"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  )
}
