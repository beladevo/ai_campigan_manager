'use client';

import { useState, useEffect } from 'react';
import CampaignCreator from '@/components/CampaignCreator';
import CampaignDashboard from '@/components/CampaignDashboard';
import UserProfile from '@/components/UserProfile';
import { Campaign } from '@/types/campaign';
import { getAllCampaigns } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard'>('create');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
      // Don't add here since we already add it in handleCampaignCreated
    },
    onCampaignError: (data) => {
      console.error('❌ Campaign error:', data);
      // Could show a toast notification here
    },
    onNotification: (data) => {
      console.log('📢 Notification:', data);
      // Could show a toast notification here
    },
  });

  useEffect(() => {
    const savedUserId = localStorage.getItem('solara_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
      loadUserCampaigns(savedUserId);
    }
  }, []);

  // Join/leave WebSocket room when userId changes
  useEffect(() => {
    if (userId && isConnected) {
      joinUserRoom(userId);
      return () => {
        leaveUserRoom(userId);
      };
    }
  }, [userId, isConnected, joinUserRoom, leaveUserRoom]);

  const loadUserCampaigns = async (userIdToLoad: string) => {
    if (!userIdToLoad) return;
    
    setIsLoading(true);
    try {
      const userCampaigns = await getAllCampaigns(userIdToLoad);
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserIdChange = (newUserId: string) => {
    setUserId(newUserId);
    if (newUserId) {
      loadUserCampaigns(newUserId);
    } else {
      setCampaigns([]);
    }
  };

  const handleCampaignCreated = (campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
    setActiveTab('dashboard');
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Solara AI <span className="text-indigo-600">Content Studio</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Create stunning marketing content for your business with AI-powered generation. 
              Perfect for e-commerce, social media, and professional campaigns.
            </p>
          </header>

          <div className="max-w-md mx-auto">
            <UserProfile userId={userId} onUserIdChange={handleUserIdChange} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with Animation */}
        <header className="text-center mb-12 animate-fade-in">
          <div className="relative">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Solara AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Content Studio</span>
            </h1>
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Transform your ideas into stunning marketing content with cutting-edge AI. 
            From social media posts to product launches—create professional campaigns in seconds.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['AI-Powered', 'Fast Generation', 'Professional Quality', 'Multiple Formats'].map((feature, index) => (
              <span 
                key={feature}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {feature}
              </span>
            ))}
          </div>
          
          {/* WebSocket Status Indicator */}
          <div className="flex justify-center mt-6">
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              {isConnected ? 'Real-time updates active' : 'Connecting...'}
            </div>
          </div>
        </header>

        {/* User Profile with Better Styling */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <UserProfile userId={userId} onUserIdChange={handleUserIdChange} />
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex justify-center mb-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/50">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              ✨ Create Campaign
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              📊 My Campaigns ({campaigns.length})
            </button>
          </div>
        </nav>

        {/* Enhanced Main Content */}
        <main className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-16 text-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading your campaigns...</h3>
              <p className="text-gray-600">Please wait while we fetch your content</p>
            </div>
          ) : activeTab === 'create' ? (
            <div className="animate-slide-up">
              <CampaignCreator onCampaignCreated={handleCampaignCreated} userId={userId} />
            </div>
          ) : (
            <div className="animate-slide-up">
              <CampaignDashboard campaigns={campaigns} setCampaigns={setCampaigns} />
            </div>
          )}
        </main>

        {/* Enhanced Footer */}
        <footer className="text-center mt-20 py-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 py-6 px-8 inline-block">
            <p className="text-gray-600 font-medium">
              🚀 Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold">Solara AI Mini System</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
