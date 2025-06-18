import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { MailCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function EmailConfirmationPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Récupère l'email de l'utilisateur actuel
  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email ?? null)
    }
    fetchEmail()
  }, [])

  // Vérifie toutes les 5 secondes si l'email est confirmé
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (user.email_confirmed_at) {
        // Option : aller chercher le rôle dans profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        toast.success("Email confirmé ! 🎉")
        navigate(profile?.role === 'admin' ? '/admin' : '/')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [navigate])

  const resendEmail = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Utilisateur non connecté.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email })
    setLoading(false)

    if (error) {
      toast.error("Erreur lors de l'envoi : " + error.message)
    } else {
      toast.success("Lien de confirmation envoyé ! 📧")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-black via-emerald-950 to-gray-900 px-4 text-center">
      <MailCheck className="w-14 h-14 text-emerald-400 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Confirme ton adresse courriel</h1>
      <p className="text-emerald-300 mb-4">
        Nous t'avons envoyé un lien de confirmation à <span className="font-semibold">{email}</span>.
        <br />
        Tu dois cliquer dessus pour activer ton compte.
      </p>

      <button
        onClick={resendEmail}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-full text-sm flex items-center gap-2"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        Renvoyer le lien
      </button>

      <button
        onClick={() => navigate('/')}
        className="text-sm text-emerald-300 mt-6 underline hover:text-emerald-100"
      >
        Retour à l'accueil
      </button>
    </div>
  )
}
