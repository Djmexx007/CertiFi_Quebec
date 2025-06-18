import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-emerald-100 px-4">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
      <p className="text-sm text-emerald-300 mb-6">
        Oups, cette page n'existe pas. Tu peux revenir à l'accueil.
      </p>
      <Link
        to="/"
        className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-full text-white text-sm"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
