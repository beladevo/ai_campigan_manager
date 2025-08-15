'use client';

import { useEffect, useState } from 'react';
import { Campaign } from '@/types/campaign';
import { getCampaign } from '@/lib/api';
import { Clock, CheckCircle, XCircle, Loader2, Eye, Download, Copy } from 'lucide-react';

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

  // Note: Polling removed - using WebSocket real-time updates instead
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     campaigns
  //       .filter(campaign => campaign.status === 'PENDING' || campaign.status === 'PROCESSING')
  //       .forEach(campaign => {
  //         refreshCampaign(campaign.id);
  //       });
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [campaigns]);

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
    const imageUrl = imagePath?.startsWith('http') 
      ? imagePath 
      : `http://localhost:3000/output/${imagePath}`;
    link.href = imageUrl;
    link.download = `campaign_${campaignId}_image.png`;
    link.click();
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No campaigns yet</h3>
        <p className="text-gray-500">Create your first campaign to get started with AI-powered content generation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Your Campaigns</h2>
          <p className="text-gray-600">Manage and track your content generation campaigns</p>
        </div>

        <div className="divide-y divide-gray-100">
          {campaigns.map((campaign, index) => (
            <div 
              key={campaign.id} 
              className={`p-8 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 hover-lift animate-slide-up ${
                campaign.status === 'PROCESSING' ? 'status-processing' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="mr-3">
                      {getStatusIcon(campaign.status)}
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatusColor(campaign.status)} shadow-sm`}>
                      {campaign.status}
                    </span>
                    <div className="ml-4 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {new Date(campaign.createdAt).toLocaleDateString()} at{' '}
                      {new Date(campaign.createdAt).toLocaleTimeString()}
                    </div>
                    {campaign.status === 'COMPLETED' && (
                      <div className="ml-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        ✨ Ready
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">
                    Campaign <span className="text-indigo-600">#{campaign.id.slice(-8)}</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {campaign.prompt}
                  </p>
                  
                  {campaign.status === 'FAILED' && campaign.errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-center mb-2">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="font-semibold text-red-700">Error Details</span>
                      </div>
                      <p className="text-sm text-red-700">{campaign.errorMessage}</p>
                    </div>
                  )}

                  {campaign.status === 'PROCESSING' && (
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-center">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-3" />
                        <span className="font-semibold text-blue-700">AI is generating your content...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="px-6 py-3 text-indigo-600 hover:bg-indigo-500 hover:text-white bg-indigo-50 rounded-xl transition-all duration-300 flex items-center font-semibold hover-lift"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Details
                  </button>
                  
                  {campaign.status === 'PROCESSING' || campaign.status === 'PENDING' ? (
                    <button
                      onClick={() => refreshCampaign(campaign.id)}
                      disabled={refreshing.includes(campaign.id)}
                      className="px-4 py-3 text-blue-600 hover:bg-blue-500 hover:text-white bg-blue-50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh status"
                    >
                      <Loader2 className={`w-5 h-5 ${refreshing.includes(campaign.id) ? 'animate-spin' : ''}`} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Campaign Details - {selectedCampaign.id.slice(-8)}
              </h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Original Prompt</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedCampaign.prompt}</p>
                </div>
              </div>

              {selectedCampaign.generatedText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Generated Content</h4>
                    <button
                      onClick={() => copyToClipboard(selectedCampaign.generatedText!)}
                      className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.generatedText}</p>
                  </div>
                </div>
              )}

              {selectedCampaign.imagePath && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Generated Image</h4>
                    <button
                      onClick={() => downloadImage(selectedCampaign.imagePath!, selectedCampaign.id)}
                      className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img
                      src={selectedCampaign.imagePath?.startsWith('http') 
                        ? selectedCampaign.imagePath 
                        : `http://localhost:3000/output/${selectedCampaign.imagePath}`}
                      alt="Generated campaign image"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      onError={(e) => {
                        console.error('Image failed to load:', e.currentTarget.src);
                        console.log('imagePath value:', selectedCampaign.imagePath);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                <span>User ID: {selectedCampaign.userId}</span>
                <span>
                  Created: {new Date(selectedCampaign.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}