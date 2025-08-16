'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { format } from 'date-fns';
import MarkdownRenderer from './MarkdownRenderer';

interface CampaignHistoryProps {
  campaigns: Campaign[];
}

export default function CampaignHistory({ campaigns }: CampaignHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'status' | 'prompt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const campaignDate = new Date(campaign.createdAt);
        const now = new Date();
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        matchesDate = campaignDate >= cutoffDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'prompt':
          comparison = a.prompt.localeCompare(b.prompt);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [campaigns, searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
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

  const exportCampaigns = () => {
    const dataStr = JSON.stringify(filteredAndSortedCampaigns, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campaigns-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
          <p className="text-gray-600 mt-1">
            Showing {filteredAndSortedCampaigns.length} of {campaigns.length} campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportCampaigns}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as typeof sortBy);
                setSortOrder(order as typeof sortOrder);
              }}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAndSortedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAndSortedCampaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center mb-3">
                      {getStatusIcon(campaign.status)}
                      <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        Campaign #{campaign.id.slice(-8)}
                      </span>
                      <span className="ml-auto text-sm text-gray-500">
                        {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>

                    {/* Prompt */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Original Prompt</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm line-clamp-2">
                        {campaign.prompt}
                      </p>
                    </div>

                    {/* Generated Content Preview */}
                    {campaign.generatedText && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Generated Content</h4>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg max-h-32 overflow-hidden relative">
                          <MarkdownRenderer 
                            content={campaign.generatedText.length > 200 
                              ? campaign.generatedText.substring(0, 200) + '...' 
                              : campaign.generatedText
                            } 
                            className="text-sm"
                          />
                          {campaign.generatedText.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-indigo-50 to-transparent"></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      {campaign.progressPercentage !== undefined && (
                        <span>Progress: {campaign.progressPercentage}%</span>
                      )}
                      {campaign.startedAt && (
                        <span>Started: {format(new Date(campaign.startedAt), 'HH:mm')}</span>
                      )}
                      {campaign.completedAt && (
                        <span>Completed: {format(new Date(campaign.completedAt), 'HH:mm')}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
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
              {/* Status and Timing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(selectedCampaign.status)}
                  </div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCampaign.status}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(new Date(selectedCampaign.createdAt), 'MMM dd')}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCampaign.completedAt && selectedCampaign.startedAt
                      ? `${Math.round((new Date(selectedCampaign.completedAt).getTime() - new Date(selectedCampaign.startedAt).getTime()) / 1000)}s`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Full content display similar to CampaignDashboard modal */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Original Prompt</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedCampaign.prompt}</p>
                </div>
              </div>

              {selectedCampaign.generatedText && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Generated Content</h4>
                  <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <MarkdownRenderer content={selectedCampaign.generatedText} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}