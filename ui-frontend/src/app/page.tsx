'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import CampaignCreator from '@/components/CampaignCreator';
import CampaignDashboard from '@/components/CampaignDashboard';
import UserProfile from '@/components/UserProfile';
import { Campaign } from '@/types/campaign';
import { getAllCampaigns, getUserUsage } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  User, Plus, LayoutDashboard, Search, Bell, Settings, 
  Sparkles, Zap, TrendingUp, ChevronDown, Menu, X 
} from 'lucide-react';

function AuthenticatedApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard' | 'analytics' | 'templates'>('dashboard');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [usage, setUsage] = useState<{
    campaignsUsedThisMonth: number;
    subscriptionTier: string;
    canCreateCampaign: boolean;
  } | null>(null);

  // WebSocket for real-time updates
  const { isConnected, joinUserRoom, leaveUserRoom } = useWebSocket({
    onCampaignUpdate: (data) => {
      console.log('🔄 Campaign update received:', data);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === data.campaignId ? data.campaign : campaign
        )
      );
    },
    onCampaignCreated: (data) => {
      console.log('✨ Campaign created:', data);
      // Refresh campaigns list
      loadCampaigns();
      loadUsage();
    },
    onCampaignError: (data) => {
      console.error('❌ Campaign error:', data);
    },
  });

  // Join user room when authenticated
  useEffect(() => {
    if (user && isConnected) {
      joinUserRoom(user.id);
      return () => leaveUserRoom(user.id);
    }
  }, [user, isConnected, joinUserRoom, leaveUserRoom]);

  // Load campaigns and usage when authenticated
  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadUsage();
    }
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;
    
    try {
      const userCampaigns = await getAllCampaigns();
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadUsage = async () => {
    if (!user) return;
    
    try {
      const usageData = await getUserUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    setActiveTab('dashboard');
    loadUsage(); // Refresh usage after creating a campaign
  };

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Modern Header with Glassmorphism */}
      <header className={`backdrop-blur-xl border-b transition-all duration-300 sticky top-0 z-50 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/50' 
          : 'bg-white/70 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group cursor-pointer">
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-110">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <span className={`text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent ${
                    isDarkMode ? 'from-violet-400 to-purple-400' : ''
                  }`}>
                    Solara AI
                  </span>
                  <div className="text-xs text-slate-500 font-medium">Creative Studio</div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 backdrop-blur-sm">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'create', label: 'Create', icon: Plus },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  { id: 'templates', label: 'Templates', icon: Zap },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-white text-violet-600 shadow-md scale-105'
                        : isDarkMode 
                          ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Enhanced Usage Indicator */}
              {usage && (
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-full backdrop-blur-sm border ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' 
                    : 'bg-white/50 border-slate-200/50 text-slate-600'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      usage.canCreateCampaign ? 'bg-emerald-500' : 'bg-amber-500'
                    } animate-pulse`}></div>
                    <span className="text-sm font-medium">
                      {usage.campaignsUsedThisMonth} / {
                        usage.subscriptionTier === 'enterprise' ? '∞' : 
                        usage.subscriptionTier === 'business' ? '200' :
                        usage.subscriptionTier === 'premium' ? '50' : '5'
                      }
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    usage.subscriptionTier === 'enterprise' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : usage.subscriptionTier === 'business'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : usage.subscriptionTier === 'premium'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {usage.subscriptionTier.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}>
                  <Search className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-full transition-all duration-200 hover:scale-110 relative ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}>
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    isDarkMode 
                      ? 'text-yellow-400 hover:bg-slate-700/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>

              {/* Enhanced User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserProfile(true)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300' 
                      : 'bg-white/50 hover:bg-white/80 text-slate-700'
                  } backdrop-blur-sm border border-slate-200/20`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                      isConnected 
                        ? 'bg-emerald-500 border-emerald-400' 
                        : 'bg-red-500 border-red-400'
                    }`}></div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{user.firstName}</div>
                    <div className="text-xs opacity-75">{user.email}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={`md:hidden border-t backdrop-blur-xl ${
            isDarkMode 
              ? 'border-slate-700/50 bg-slate-900/90' 
              : 'border-slate-200/50 bg-white/90'
          }`}>
            <div className="px-4 py-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'create', label: 'Create', icon: Plus },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'templates', label: 'Templates', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-violet-500 text-white shadow-lg'
                      : isDarkMode 
                        ? 'text-slate-300 hover:bg-slate-700/50'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200/20 mb-6">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-violet-300' : 'text-violet-600'
                }`}>AI-Powered Content Creation</span>
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
                isDarkMode 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent'
              }`}>
                Create Amazing Content 
                <span className="block bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                  with AI Magic
                </span>
              </h1>
              <p className={`text-lg max-w-3xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Generate professional marketing content, social media posts, and engaging copy 
                with our advanced AI technology. Transform your ideas into compelling stories.
              </p>
            </div>
            <CampaignCreator 
              onCampaignCreated={handleCampaignCreated}
              usage={usage}
            />
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Campaign Dashboard
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Manage and monitor your AI-generated content
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center space-x-2 hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>New Campaign</span>
              </button>
            </div>
            <CampaignDashboard campaigns={campaigns} setCampaigns={setCampaigns} />
          </div>
        ) : (
          <div className={`text-center py-20 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p>This section is under development</p>
          </div>
        )}
      </main>

      {/* Enhanced User Profile Modal */}
      {user && (
        <UserProfile
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            subscriptionTier: user.subscriptionTier,
            campaignsUsedThisMonth: usage?.campaignsUsedThisMonth || 0,
          }}
          onLogout={logout}
          isVisible={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
}

function LoginPage() {
  const { login, register, isLoading, error } = useAuth();

  return (
    <AuthForm
      onLogin={login}
      onRegister={register}
      isLoading={isLoading}
      error={error}
    />
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <AuthenticatedApp />;
  } else {
    return <LoginPage />;
  }
}