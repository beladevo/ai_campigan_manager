'use client';

import { User, Settings, LogOut, Crown, BarChart3 } from 'lucide-react';

interface UserProfileProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    subscriptionTier: string;
    campaignsUsedThisMonth: number;
  };
  onLogout: () => void;
  isVisible: boolean;
  onClose: () => void;
}

const TIER_LIMITS = {
  free: 5,
  premium: 50,
  business: 200,
  enterprise: Infinity,
};

const TIER_COLORS = {
  free: 'bg-gray-100 text-gray-800',
  premium: 'bg-blue-100 text-blue-800',
  business: 'bg-purple-100 text-purple-800',
  enterprise: 'bg-yellow-100 text-yellow-800',
};

export default function UserProfile({ user, onLogout, isVisible, onClose }: UserProfileProps) {
  if (!isVisible) return null;

  const limit = TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS] || 5;
  const usagePercentage = limit === Infinity ? 0 : (user.campaignsUsedThisMonth / limit) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Subscription Tier */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Subscription</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[user.subscriptionTier as keyof typeof TIER_COLORS]}`}>
                    <Crown className="w-3 h-3 mr-1" />
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                  </span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">This Month&apos;s Usage</span>
                  <span className="text-sm text-gray-600">
                    {user.campaignsUsedThisMonth} / {limit === Infinity ? '∞' : limit}
                  </span>
                </div>
                {limit !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${usagePercentage >= 100 ? 'bg-red-500' : usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Upgrade CTA for Free Users */}
              {user.subscriptionTier === 'free' && usagePercentage >= 80 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Upgrade to Premium</h4>
                      <p className="text-xs text-blue-700">Get 50 campaigns/month + advanced features</p>
                    </div>
                  </div>
                  <button className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Upgrade Now
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onLogout}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}