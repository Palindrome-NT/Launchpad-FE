import React from 'react';
import { User } from '../../lib/types/auth';

interface UserListItemProps {
  user: User;
  isOnline: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, isOnline, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="relative">
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={user.name || user.email}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {user.name || 'Anonymous'}
        </h3>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;

