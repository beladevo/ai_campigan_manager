'use client';

import { 
  User, Settings, LogOut, Crown, BarChart3, Mail, Calendar, 
  Star, Shield, Zap, Sparkles, X, Edit, Camera 
} from 'lucide-react';

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
  free: 'bg-slate-100 text-slate-700 border-slate-200',
  premium: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-300',
  business: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300',
  enterprise: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300',
};

const TIER_FEATURES = {
  free: ['5 campaigns/month', 'Basic templates', 'Standard support'],
  premium: ['100 campaigns/month', 'All templates', 'Priority support', 'Analytics'],
  business: ['500 campaigns/month', 'Custom templates', 'Priority support', 'Advanced analytics', 'Team features'],
  enterprise: ['Unlimited campaigns', 'Custom templates', '24/7 support', 'Advanced analytics', 'API access', 'White-label'],
};

export default function UserProfile({ user, onLogout, isVisible, onClose }: UserProfileProps) {
  if (!isVisible) return null;

  const limit = TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS] || 5;
  const usagePercentage = limit === Infinity ? 0 : (user.campaignsUsedThisMonth / limit) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced backdrop with blur */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300" 
          onClick={onClose}
        ></div>

        {/* Modern modal with glassmorphism */}
        <div className="inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/20">
          
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 px-6 pt-6 pb-24">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

            {/* User info header */}
            <div className="relative z-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {/* Profile picture placeholder with gradient */}
                  <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {/* Edit button overlay */}
                  <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-white text-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-white">
                      {user.firstName} {user.lastName}
                    </h2>
                    <button className="p-1 rounded-full hover:bg-white/20 transition-colors">
                      <Edit className="w-4 h-4 text-white/80" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-white/80" />
                    <p className="text-white/90">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-white/80" />
                    <p className="text-white/90 text-sm">Member since 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="relative -mt-16 px-6 pb-6">
            
            {/* Subscription tier card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Plan</h3>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${TIER_COLORS[user.subscriptionTier as keyof typeof TIER_COLORS]}`}>
                  <Crown className="w-4 h-4 inline mr-2" />
                  {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                </div>
              </div>
              
              {/* Features list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {TIER_FEATURES[user.subscriptionTier as keyof typeof TIER_FEATURES]?.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade button for non-enterprise users */}
              {user.subscriptionTier !== 'enterprise' && (
                <button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Upgrade Plan</span>
                </button>
              )}
            </div>

            {/* Usage analytics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {/* Campaigns usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Campaigns This Month</span>
                    <span className="text-lg font-bold text-gray-900">
                      {user.campaignsUsedThisMonth} / {limit === Infinity ? '∞' : limit}
                    </span>
                  </div>
                  
                  {limit !== Infinity && (
                    <div className="relative">
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            usagePercentage >= 100 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                              : usagePercentage >= 80 
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {usagePercentage.toFixed(0)}% of monthly limit used
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievement badges */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{user.campaignsUsedThisMonth}</div>
                    <div className="text-xs text-gray-500">Total Campaigns</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">A+</div>
                    <div className="text-xs text-gray-500">Quality Score</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="group flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-200">
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-violet-500 mr-3 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">Account Settings</span>
              </button>
              <button className="group flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-200">
                <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-violet-500 mr-3 transition-colors" />
                <span className="font-medium text-gray-700 group-hover:text-gray-900">View Analytics</span>
              </button>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}