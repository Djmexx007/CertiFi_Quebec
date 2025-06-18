import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Sparkles, Zap, Terminal, Wand2, PartyPopper, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const funActions = [
  {
    icon: PartyPopper,
    label: 'Confetti Party',
    description: 'Lance une pluie de confettis !',
    color: 'text-yellow-400',
    action: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  },
  {
    icon: Terminal,
    label: 'Mode Hacker',
    description: 'Active le mode Matrix',
    color: 'text-green-400',
    action: () => {
      // Appliquer le style directement au body
      document.body.classList.add('hacker-mode');
      
      // Ajouter une classe CSS temporaire
      const style = document.createElement('style');
      style.id = 'hacker-mode-style';
      style.innerHTML = `
        .hacker-mode {
          background-color: #000 !important;
          color: #0f0 !important;
          transition: all 0.5s ease;
        }
        .hacker-mode * {
          color: #0f0 !important;
          border-color: #0f0 !important;
        }
        .hacker-mode button, .hacker-mode div {
          background-color: rgba(0, 50, 0, 0.3) !important;
        }
      `;
      document.head.appendChild(style);
      
      toast('🖥️ Mode Hacker activé !', {
        icon: '🕵️‍♂️',
        style: {
          background: '#10B981',
          color: '#fff'
        }
      });
      
      // Désactiver après 5 secondes
      setTimeout(() => {
        document.body.classList.remove('hacker-mode');
        const styleElement = document.getElementById('hacker-mode-style');
        if (styleElement) {
          styleElement.remove();
        }
      }, 5000);
    }
  },
  {
    icon: Wand2,
    label: 'Super Pouvoir',
    description: 'Deviens un super admin !',
    color: 'text-purple-400',
    action: () => {
      toast('🦸‍♂️ Super pouvoirs activés !', {
        icon: '⚡',
        style: {
          background: '#8B5CF6',
          color: '#fff'
        }
      })
    }
  },
  {
    icon: Zap,
    label: 'Mode Turbo',
    description: 'Accélère toutes les animations',
    color: 'text-blue-400',
    action: () => {
      // Créer une variable CSS pour contrôler la vitesse des animations
      const style = document.createElement('style');
      style.id = 'turbo-mode-style';
      style.innerHTML = `
        * {
          animation-duration: 0.3s !important;
          transition-duration: 0.3s !important;
        }
      `;
      document.head.appendChild(style);
      
      toast('🚀 TURBO MODE !', {
        icon: '⚡',
        style: {
          background: '#3B82F6',
          color: '#fff'
        }
      });
      
      // Désactiver après 5 secondes
      setTimeout(() => {
        const styleElement = document.getElementById('turbo-mode-style');
        if (styleElement) {
          styleElement.remove();
        }
      }, 5000);
    }
  }
]

export default function AdminFun() {
  const { profile, loading } = useUserProfile()
  const navigate = useNavigate()
  const [activeEffect, setActiveEffect] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      navigate('/')
    }
  }, [loading, profile, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Fonctions Fun
          </h1>
          <button
            onClick={() => navigate('/admin/menu')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au menu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveEffect(action.label)
                action.action()
                setTimeout(() => setActiveEffect(null), 1000)
              }}
              className={`
                p-6 bg-zinc-800 rounded-xl border border-zinc-700 
                hover:border-emerald-500/50 transition-all group
                ${activeEffect === action.label ? 'scale-95' : 'scale-100'}
              `}
            >
              <div className="flex items-center gap-3 mb-2">
                <action.icon className={`w-6 h-6 ${action.color}`} />
                <h2 className="text-lg font-semibold text-white">{action.label}</h2>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                {action.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
          <p className="text-zinc-400 text-sm text-center">
            Ces fonctions sont purement pour le fun ! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}