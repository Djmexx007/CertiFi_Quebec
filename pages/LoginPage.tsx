import React from 'react'
import Auth from '@/components/Auth'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Auth />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 CertiFi Québec - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}