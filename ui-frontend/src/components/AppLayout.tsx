'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  BarChart3, 
  FileText, 
  History, 
  Settings, 
  User, 
  Bell,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import CampaignDashboard from './CampaignDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import TemplateLibrary from './TemplateLibrary';
import CampaignHistory from './CampaignHistory';
import UserSettings from './UserSettings';
import CampaignCreator from './CampaignCreator';
import { Campaign, CampaignTemplate } from '@/types/campaign';
import { getAllCampaigns } from '@/lib/api';

type ViewType = 'dashboard' | 'analytics' | 'templates' | 'history' | 'settings' | 'create';

interface AppLayoutProps {
  initialCampaigns?: Campaign[];
}

export default function AppLayout({ initialCampaigns = [] }: AppLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignsData = await getAllCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home, 
      current: currentView === 'dashboard',
      count: campaigns.length
    },
    { 
      id: 'create', 
      name: 'Create Campaign', 
      icon: Plus, 
      current: currentView === 'create',
      highlight: true
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: BarChart3, 
      current: currentView === 'analytics' 
    },
    { 
      id: 'templates', 
      name: 'Templates', 
      icon: FileText, 
      current: currentView === 'templates' 
    },
    { 
      id: 'history', 
      name: 'History', 
      icon: History, 
      current: currentView === 'history',
      count: campaigns.filter(c => c.status === 'COMPLETED').length
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: Settings, 
      current: currentView === 'settings' 
    },
  ];

  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD',
    plan: 'Pro Plan'
  };

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setCurrentView('create');
    // Here you would pass the template to the CampaignCreator
  };

  const handleCampaignCreated = (newCampaign: Campaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CampaignDashboard 
            campaigns={campaigns} 
            setCampaigns={setCampaigns}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard campaigns={campaigns} />;
      case 'templates':
        return (
          <TemplateLibrary 
            onSelectTemplate={handleTemplateSelect} 
            onClose={() => setCurrentView('dashboard')}
            isModal={false}
          />
        );
      case 'history':
        return <CampaignHistory campaigns={campaigns} />;
      case 'settings':
        return <UserSettings />;
      case 'create':
        return (
          <CampaignCreator 
            onCampaignCreated={handleCampaignCreated}
          />
        );
      default:
        return <CampaignDashboard campaigns={campaigns} setCampaigns={setCampaigns} />;
    }
  };

  const getPageTitle = () => {
    const page = navigation.find(nav => nav.id === currentView);
    return page?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Solara AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as ViewType);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                      : item.highlight
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.count !== undefined && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.current 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center p-3 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userInfo.avatar}
                </div>
                <div className="ml-3 text-left flex-1">
                  <p className="font-medium text-gray-900">{userInfo.name}</p>
                  <p className="text-xs text-gray-500">{userInfo.plan}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                  </button>
                  <hr className="my-2" />
                  <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick create button */}
              <button
                onClick={() => setCurrentView('create')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}