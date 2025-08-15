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
import { User, Plus, LayoutDashboard } from 'lucide-react';

function AuthenticatedApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard'>('create');
  const [showUserProfile, setShowUserProfile] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Solara AI</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'create'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-1" />
                  Dashboard
                </button>
              </nav>

              {/* Usage indicator */}
              {usage && (
                <div className="text-xs text-gray-500">
                  {usage.campaignsUsedThisMonth} / {usage.subscriptionTier === 'enterprise' ? '∞' : 
                    usage.subscriptionTier === 'business' ? '200' :
                    usage.subscriptionTier === 'premium' ? '50' : '5'} this month
                </div>
              )}

              {/* Connection status */}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />

              {/* User menu */}
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{user.firstName}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create Amazing Content with AI
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Generate professional marketing content, social media posts, and engaging copy 
                with our advanced AI technology.
              </p>
            </div>
            <CampaignCreator 
              onCampaignCreated={handleCampaignCreated}
              usage={usage}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Your Campaigns</h1>
              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </button>
            </div>
            <CampaignDashboard campaigns={campaigns} setCampaigns={setCampaigns} />
          </div>
        )}
      </main>

      {/* User Profile Modal */}
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