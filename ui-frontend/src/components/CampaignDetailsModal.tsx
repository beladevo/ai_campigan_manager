'use client';

import { useState } from 'react';
import { 
  X, Copy, Download, Share2, Calendar, Clock, User, 
  Sparkles, Image as ImageIcon, FileText, CheckCircle,
  AlertCircle, Loader2, ExternalLink, Heart
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { formatDistanceToNow, format } from 'date-fns';
import MarkdownRenderer from './MarkdownRenderer';
import FacebookAnalytics from './FacebookAnalytics';

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  onClose: () => void;
}

const statusConfig = {
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Completed'
  },
  PROCESSING: {
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Processing'
  },
  FAILED: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Failed'
  },
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  }
};

export default function CampaignDetailsModal({ campaign, onClose }: CampaignDetailsModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'facebook' | 'analytics'>('content');

  if (!campaign) return null;

  const status = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadImage = async () => {
    if (!campaign.imagePath) return;
    
    try {
      const imageUrl = campaign.imagePath.startsWith('http') 
        ? campaign.imagePath 
        : `http://localhost:3000/output/${campaign.imagePath}`;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaign-${campaign.id.slice(-8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const shareContent = async () => {
    const shareData = {
      title: `Campaign ${campaign.id.slice(-8)}`,
      text: campaign.generatedText || campaign.prompt,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(shareData.text);
    }
  };

  const getImageUrl = () => {
    if (!campaign.imagePath) return '';
    
    // Fix the image path - remove any container path prefixes
    let cleanPath = campaign.imagePath;
    
    // Log for debugging
    console.log('Original imagePath:', campaign.imagePath);
    
    // Strip all variations of path prefixes to get just the filename
    cleanPath = cleanPath
      .replace(/^\/app\/output\//, '')     // Remove /app/output/
      .replace(/^app\/output\//, '')       // Remove app/output/
      .replace(/^\/output\//, '')          // Remove /output/
      .replace(/^output\//, '')            // Remove output/
      .replace(/^\//, '');                 // Remove leading slash
    
    const finalUrl = `http://localhost:3000/output/${cleanPath}`;
    console.log('Cleaned path:', cleanPath);
    console.log('Final image URL:', finalUrl);
    
    return finalUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-all duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 relative z-10">

        {/* Modal */}
        <div 
          className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 px-8 pt-8 pb-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

            {/* Header content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Campaign Details
                      </h2>
                      <p className="text-white/80 text-sm">
                        ID: {campaign.id.slice(-12)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${status.bgColor} ${status.borderColor} border backdrop-blur-sm`}>
                    <StatusIcon className={`w-4 h-4 mr-2 ${status.color} ${campaign.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    <span className={`text-sm font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={shareContent}
                    className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                    title="Add to favorites"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="px-8">
              <nav className="flex space-x-8" aria-label="Tabs">
                {[
                  { id: 'content', name: 'Content & Details', icon: FileText },
                  { id: 'facebook', name: 'Facebook Marketing', icon: Share2 },
                  { id: 'analytics', name: 'Performance', icon: TrendingUp },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-violet-500 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Original Prompt */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Original Prompt
                    </h3>
                    {campaign.prompt.length > 200 && (
                      <button
                        onClick={() => setShowFullPrompt(!showFullPrompt)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showFullPrompt ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {showFullPrompt ? campaign.prompt : campaign.prompt.substring(0, 200)}
                      {!showFullPrompt && campaign.prompt.length > 200 && '...'}
                    </p>
                  </div>
                </div>

                {/* Generated Content */}
                {campaign.generatedText && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        Generated Content
                      </h3>
                      <button
                        onClick={() => copyToClipboard(campaign.generatedText!)}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          copied 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'
                        } border`}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Content'}
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none bg-gray-50 rounded-xl p-4">
                      <MarkdownRenderer 
                        content={campaign.generatedText} 
                        className="text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {campaign.errorMessage && (
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-800 flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Error Details
                    </h3>
                    <p className="text-red-700 text-sm">{campaign.errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Right Column - Image & Metadata */}
              <div className="space-y-6">
                
                {/* Generated Image */}
                {campaign.imagePath && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
                        Generated Image
                      </h3>
                      <button
                        onClick={downloadImage}
                        className="flex items-center px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-emerald-200"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    
                    <div className="relative group">
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      )}
                      
                      {!imageError ? (
                        <img
                          src={getImageUrl()}
                          alt="Generated campaign image"
                          className={`w-full h-auto rounded-xl shadow-lg transition-all duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          } group-hover:shadow-xl`}
                          onLoad={() => setImageLoading(false)}
                          onError={(e) => {
                            console.error('Image failed to load:', e.currentTarget.src);
                            console.log('Campaign imagePath:', campaign.imagePath);
                            setImageError(true);
                            setImageLoading(false);
                          }}
                        />
                      ) : (
                        <div className="w-full rounded-xl overflow-hidden">
                          <img
                            src="https://www.svgrepo.com/show/451131/no-image.svg"
                            alt="No image available"
                            className="w-full h-auto rounded-xl"
                            style={{ maxHeight: '300px', objectFit: 'contain' }}
                          />
                          <div className="text-center mt-2">
                            <p className="text-sm text-gray-500">Image failed to load</p>
                            <p className="text-xs text-gray-400 mt-1">Path: {campaign.imagePath}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Campaign Metadata */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Info</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p className="text-sm font-medium text-gray-900">{campaign.userId}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(campaign.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {campaign.completedAt && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(campaign.completedAt), 'MMM d, yyyy HH:mm')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(campaign.completedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}

                    {campaign.progressPercentage !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="text-sm font-medium text-gray-900">{campaign.progressPercentage}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${campaign.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Last updated: {formatDistanceToNow(new Date(campaign.updatedAt), { addSuffix: true })}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.open(`/campaigns/${campaign.id}`, '_blank')}
                className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-200 flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}