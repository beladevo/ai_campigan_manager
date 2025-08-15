'use client';

import { useState, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  onUserIdChange: (userId: string) => void;
}

export default function UserProfile({ userId, onUserIdChange }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserId, setTempUserId] = useState(userId);

  useEffect(() => {
    setTempUserId(userId);
  }, [userId]);

  const handleSave = () => {
    if (tempUserId.trim()) {
      onUserIdChange(tempUserId.trim());
      setIsEditing(false);
      localStorage.setItem('solara_user_id', tempUserId.trim());
    }
  };

  const handleCancel = () => {
    setTempUserId(userId);
    setIsEditing(false);
  };

  const handleLogout = () => {
    onUserIdChange('');
    localStorage.removeItem('solara_user_id');
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
        <User className="w-8 h-8 text-indigo-600" />
        <div className="flex-1">
          <input
            type="text"
            value={tempUserId}
            onChange={(e) => setTempUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your user ID"
            autoFocus
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Solara AI</h3>
        <p className="text-gray-600 mb-4">Please set your user ID to get started</p>
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Set User ID
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{userId}</h3>
          <p className="text-sm text-gray-500">Content Creator</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          title="Edit Profile"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}