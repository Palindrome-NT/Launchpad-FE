import React from 'react';
import { User } from '../../lib/types/auth';
import { Mail, Phone, CreditCard, Shield, Calendar, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui';

interface UserCardProps {
  user: User;
  onDelete: (userId: string) => void;
  currentUserId?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onDelete, currentUserId }) => {
  const isCurrentUser = currentUserId === user._id;

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getProviderBadgeColor = (provider?: string) => {
    return provider === 'google'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.name || 'No Name'}
              {isCurrentUser && (
                <span className="ml-2 text-xs font-normal text-blue-600">(You)</span>
              )}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role}
              </span>
              {user.provider && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getProviderBadgeColor(user.provider)}`}>
                  {user.provider}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isCurrentUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user._id)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{user.email}</span>
        </div>

        {user.mobile && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{user.mobile}</span>
          </div>
        )}

        {user.aadhaarNumber && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span>****{user.aadhaarNumber.slice(-4)}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Joined {formatDate(user.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {user.isVerified ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {user.isVerified ? 'Verified' : 'Unverified'}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

