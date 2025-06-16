import React from 'react';
import { Shield, TrendingUp, Star } from 'lucide-react';
import { UserRole } from '../types/auth';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'PQAP':
        return {
          label: 'PQAP',
          icon: Shield,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'FONDS_MUTUELS':
        return {
          label: 'Fonds Mutuels',
          icon: TrendingUp,
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'LES_DEUX':
        return {
          label: 'Les Deux',
          icon: Star,
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizes[size]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};