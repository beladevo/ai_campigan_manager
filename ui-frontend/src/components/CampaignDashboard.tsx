'use client';

import { useEffect, useState } from 'react';
import { Campaign } from '@/types/campaign';
import { getCampaign } from '@/lib/api';
import { 
  Clock, CheckCircle, XCircle, Loader2, Eye, Download, Copy, Bell, 
  Share2, Heart, Bookmark, MoreVertical, Trash2, Edit3, Filter,
  Search, Calendar, TrendingUp, ExternalLink, Twitter, Facebook,
  Linkedin, Instagram, MessageCircle, Sparkles, Palette, FileText,
  FileDown
} from 'lucide-react';
import CampaignProgress from './CampaignProgress';
import MarkdownRenderer from './MarkdownRenderer';
import MarkdownPreview from './MarkdownPreview';
import CampaignDetailsModal from './CampaignDetailsModal';
import ExportModal from './ExportModal';

interface CampaignDashboardProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

const getStatusIcon = (status: Campaign['status']) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'PROCESSING':
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'COMPLETED':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'FAILED':
      return <XCircle className="w-5 h-5 text-red-500" />;
  }
};

const getStatusColor = (status: Campaign['status']) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
  }
};

export default function CampaignDashboard({ campaigns, setCampaigns }: CampaignDashboardProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [refreshing, setRefreshing] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{[key: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState<Campaign | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedCampaignsForExport, setSelectedCampaignsForExport] = useState<string[]>([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  // Helper function to clean image paths
  const getCleanImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Strip all variations of path prefixes to get just the filename
    const cleanPath = imagePath
      .replace(/^\/app\/output\//, '')     // Remove /app/output/
      .replace(/^app\/output\//, '')       // Remove app/output/
      .replace(/^\/output\//, '')          // Remove /output/
      .replace(/^output\//, '')            // Remove output/
      .replace(/^\//, '');                 // Remove leading slash
    
    return `http://localhost:3000/output/${cleanPath}`;
  };

  // Real-time polling for active campaigns
  useEffect(() => {
    const activeCampaigns = campaigns.filter(
      campaign => campaign.status === 'PENDING' || campaign.status === 'PROCESSING'
    );

    if (activeCampaigns.length === 0) return;

    const interval = setInterval(() => {
      activeCampaigns.forEach(campaign => {
        refreshCampaign(campaign.id);
      });
    }, 2000); // Poll every 2 seconds for real-time updates

    return () => clearInterval(interval);
  }, [campaigns]);

  // Notification system for completed campaigns
  useEffect(() => {
    campaigns.forEach(campaign => {
      if (campaign.status === 'COMPLETED' && !notifications[campaign.id]) {
        setNotifications(prev => ({ ...prev, [campaign.id]: true }));
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(`Campaign #${campaign.id.slice(-8)} Complete!`, {
            body: 'Your AI-generated content is ready.',
            icon: '/favicon.ico',
          });
        }
      }
    });
  }, [campaigns, notifications]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const refreshCampaign = async (campaignId: string) => {
    if (refreshing.includes(campaignId)) return;
    
    setRefreshing(prev => [...prev, campaignId]);
    try {
      const updatedCampaign = await getCampaign(campaignId);
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId ? updatedCampaign : campaign
        )
      );
    } catch (error) {
      console.error('Failed to refresh campaign:', error);
    } finally {
      setRefreshing(prev => prev.filter(id => id !== campaignId));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadImage = (imagePath: string, campaignId: string) => {
    const link = document.createElement('a');
    const imageUrl = getCleanImageUrl(imagePath);
    link.href = imageUrl;
    link.download = `campaign_${campaignId}_image.png`;
    link.click();
  };

  const toggleFavorite = (campaignId: string) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const shareToSocialMedia = (platform: string, content: string, campaignId: string) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.slice(0, 280))}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      instagram: '#', // Instagram doesn't support direct text sharing
    };
    
    if (urls[platform as keyof typeof urls] !== '#') {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
    setShowShareModal(null);
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaignsForExport(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const selectAllCampaigns = () => {
    setSelectedCampaignsForExport(filteredCampaigns.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCampaignsForExport([]);
    setBulkSelectMode(false);
  };

  const handleExportSelected = () => {
    if (selectedCampaignsForExport.length > 0) {
      setShowExportModal(true);
    }
  };

  const handleExportSingle = (campaign: Campaign) => {
    setSelectedCampaignsForExport([campaign.id]);
    setShowExportModal(true);
  };

  const getSelectedCampaigns = () => {
    return campaigns.filter(c => selectedCampaignsForExport.includes(c.id));
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (campaigns.length === 0) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-xl p-16 text-center border border-violet-100">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No campaigns yet</h3>
        <p className="text-gray-600 text-lg mb-6">Create your first campaign to get started with AI-powered content generation.</p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-full text-violet-600 font-medium">
          <FileText className="w-4 h-4" />
          <span>Ready to create amazing content?</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Search and Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Campaign Dashboard</h2>
              <p className="text-white/80">Manage and track your AI-generated content</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                {campaigns.length} Total Campaigns
              </div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                {campaigns.filter(c => c.status === 'COMPLETED').length} Completed
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Bulk Actions Button */}
            <button
              onClick={() => setBulkSelectMode(!bulkSelectMode)}
              className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                bulkSelectMode
                  ? 'bg-violet-100 border-violet-300 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Bulk Selection Toolbar */}
          {bulkSelectMode && (
            <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-violet-700">
                    {selectedCampaignsForExport.length} of {filteredCampaigns.length} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={selectAllCampaigns}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportSelected}
                    disabled={selectedCampaignsForExport.length === 0}
                    className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Export Selected</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <div 
              key={campaign.id} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-violet-200 overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header */}
              <div className="relative">
                {campaign.imagePath && (
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden">
                    <img
                      src={getCleanImageUrl(campaign.imagePath!)}
                      alt="Campaign preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://www.svgrepo.com/show/451131/no-image.svg';
                        e.currentTarget.className = 'w-full h-full object-contain p-4 bg-gray-100';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}
                
                {!campaign.imagePath && (
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center text-violet-500">
                      <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <div className="text-sm font-medium">
                        {campaign.status === 'COMPLETED' ? 'No Image Generated' : 'Generating...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full backdrop-blur-sm border ${
                    campaign.status === 'COMPLETED' 
                      ? 'bg-emerald-500/90 text-white border-emerald-400' 
                      : campaign.status === 'PROCESSING'
                      ? 'bg-blue-500/90 text-white border-blue-400'
                      : campaign.status === 'FAILED'
                      ? 'bg-red-500/90 text-white border-red-400'
                      : 'bg-yellow-500/90 text-white border-yellow-400'
                  }`}>
                    {getStatusIcon(campaign.status)}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {campaign.status}
                    </span>
                  </div>
                </div>

                {/* Selection Checkbox */}
                {bulkSelectMode && (
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCampaignsForExport.includes(campaign.id)}
                      onChange={() => toggleCampaignSelection(campaign.id)}
                      className="w-5 h-5 text-violet-600 border-2 border-white rounded focus:ring-violet-500 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!bulkSelectMode && (
                    <>
                      <button
                        onClick={() => handleExportSingle(campaign)}
                        className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-emerald-500 transition-all"
                        title="Export campaign"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleFavorite(campaign.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                          favoriteIds.has(campaign.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favoriteIds.has(campaign.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      {campaign.status === 'COMPLETED' && (
                        <button
                          onClick={() => setShowShareModal(campaign)}
                          className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-violet-500 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg">
                    Campaign #{campaign.id.slice(-8)}
                  </h3>
                  <div className="text-xs text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {campaign.prompt}
                </p>

                {campaign.status === 'COMPLETED' && campaign.generatedText && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-violet-50 rounded-lg border border-gray-100">
                    <MarkdownRenderer 
                      content={campaign.generatedText.length > 150 
                        ? campaign.generatedText.substring(0, 150) + '...' 
                        : campaign.generatedText
                      } 
                      className="text-xs text-gray-700"
                    />
                  </div>
                )}

                {(campaign.status === 'PROCESSING' || campaign.status === 'PENDING') && (
                  <div className="mb-4">
                    <CampaignProgress campaign={campaign} />
                  </div>
                )}

                {campaign.status === 'FAILED' && campaign.errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700 text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      <span className="font-medium">Failed:</span>
                    </div>
                    <p className="text-red-600 text-xs mt-1">{campaign.errorMessage}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="flex items-center space-x-2 px-4 py-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-all text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {campaign.status === 'COMPLETED' && campaign.generatedText && (
                      <button
                        onClick={() => copyToClipboard(campaign.generatedText!)}
                        className="p-2 text-gray-600 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-all"
                        title="Copy content"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    {campaign.status === 'COMPLETED' && campaign.imagePath && (
                      <button
                        onClick={() => downloadImage(campaign.imagePath!, campaign.id)}
                        className="p-2 text-gray-600 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-all"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {(campaign.status === 'PROCESSING' || campaign.status === 'PENDING') && (
                      <button
                        onClick={() => refreshCampaign(campaign.id)}
                        disabled={refreshing.includes(campaign.id)}
                        className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                        title="Refresh status"
                      >
                        <Loader2 className={`w-4 h-4 ${refreshing.includes(campaign.id) ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredCampaigns.map((campaign, index) => (
              <div 
                key={campaign.id} 
                className="p-6 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Campaign Image Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100 flex-shrink-0">
                      {campaign.imagePath ? (
                        <img
                          src={getCleanImageUrl(campaign.imagePath!)}
                          alt="Campaign"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://www.svgrepo.com/show/451131/no-image.svg';
                            e.currentTarget.className = 'w-full h-full object-contain p-2 bg-gray-100';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-500">
                          <Palette className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Campaign Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900">
                          Campaign #{campaign.id.slice(-8)}
                        </h3>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : campaign.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-700'
                            : campaign.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getStatusIcon(campaign.status)}
                          <span>{campaign.status}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm truncate">
                        {campaign.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {campaign.status === 'COMPLETED' && campaign.generatedText && (
                      <button
                        onClick={() => copyToClipboard(campaign.generatedText!)}
                        className="p-2 text-gray-600 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-all"
                        title="Copy content"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="px-4 py-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-all text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Media Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Share Campaign</h3>
                <button
                  onClick={() => setShowShareModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Share your AI-generated content on social media
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareToSocialMedia('twitter', showShareModal.generatedText!, showShareModal.id)}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </button>

                <button
                  onClick={() => shareToSocialMedia('facebook', showShareModal.generatedText!, showShareModal.id)}
                  className="flex items-center justify-center space-x-2 p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>

                <button
                  onClick={() => shareToSocialMedia('linkedin', showShareModal.generatedText!, showShareModal.id)}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="font-medium">LinkedIn</span>
                </button>

                <button
                  onClick={() => copyToClipboard(showShareModal.generatedText!)}
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">Copy Text</span>
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {showShareModal.generatedText?.substring(0, 200)}
                  {showShareModal.generatedText && showShareModal.generatedText.length > 200 && '...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <CampaignDetailsModal
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />

      <ExportModal
        campaigns={getSelectedCampaigns()}
        isVisible={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setSelectedCampaignsForExport([]);
        }}
      />
    </div>
  );
}