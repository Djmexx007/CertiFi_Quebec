import React from 'react';
import { Shield, User, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { RoleBadge } from './RoleBadge';
import { User as UserType } from '../types/auth';

interface HeaderProps {
  user?: UserType | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CertiFi Québec</h1>
              <p className="text-xs text-gray-500">Formation Primerica</p>
            </div>
          </div>

          {/* Info utilisateur */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex items-center space-x-2">
                  <RoleBadge role={user.role} size="sm" />
                  <span className="text-xs text-gray-500">Niv. {user.level}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={onLogout}
                >
                  Déconnexion
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};