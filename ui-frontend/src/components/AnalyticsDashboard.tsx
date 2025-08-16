'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Clock, 
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { format, subDays, startOfDay } from 'date-fns';

interface AnalyticsDashboardProps {
  campaigns: Campaign[];
}

export default function AnalyticsDashboard({ campaigns }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Generate analytics data
  const analytics = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Filter campaigns by date range
    const campaignsInRange = campaigns.filter(campaign => 
      new Date(campaign.createdAt) >= startDate
    );

    // Daily campaign creation data
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = subDays(endDate, days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayCampaigns = campaignsInRange.filter(campaign => {
        const campaignDate = new Date(campaign.createdAt);
        return campaignDate >= dayStart && campaignDate < dayEnd;
      });

      return {
        date: format(date, 'MMM dd'),
        campaigns: dayCampaigns.length,
        completed: dayCampaigns.filter(c => c.status === 'COMPLETED').length,
        failed: dayCampaigns.filter(c => c.status === 'FAILED').length,
        processing: dayCampaigns.filter(c => c.status === 'PROCESSING').length,
      };
    });

    // Status distribution
    const statusData = [
      { 
        name: 'Completed', 
        value: campaignsInRange.filter(c => c.status === 'COMPLETED').length,
        color: '#10b981'
      },
      { 
        name: 'Processing', 
        value: campaignsInRange.filter(c => c.status === 'PROCESSING').length,
        color: '#3b82f6'
      },
      { 
        name: 'Failed', 
        value: campaignsInRange.filter(c => c.status === 'FAILED').length,
        color: '#ef4444'
      },
      { 
        name: 'Pending', 
        value: campaignsInRange.filter(c => c.status === 'PENDING').length,
        color: '#f59e0b'
      }
    ];

    // Performance metrics
    const totalCampaigns = campaignsInRange.length;
    const completedCampaigns = campaignsInRange.filter(c => c.status === 'COMPLETED').length;
    const successRate = totalCampaigns > 0 ? (completedCampaigns / totalCampaigns) * 100 : 0;
    
    // Average completion time (mock data for now)
    const avgCompletionTime = completedCampaigns > 0 ? 
      Math.round(45 + Math.random() * 30) : 0; // 45-75 seconds

    return {
      dailyData,
      statusData,
      totalCampaigns,
      completedCampaigns,
      successRate,
      avgCompletionTime,
      campaignsInRange
    };
  }, [campaigns, timeRange]);

  // Mock usage data for demonstration
  const usageData = [
    { name: 'Text Generation', usage: 95, limit: 100 },
    { name: 'Image Generation', usage: 78, limit: 100 },
    { name: 'API Calls', usage: 234, limit: 500 },
    { name: 'Storage', usage: 12.5, limit: 50 }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your campaign performance and usage</p>
        </div>
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Total Campaigns"
          value={analytics.totalCampaigns}
          change={12}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Success Rate"
          value={`${analytics.successRate.toFixed(1)}%`}
          change={5.2}
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Avg Completion"
          value={`${analytics.avgCompletionTime}s`}
          change={-8.3}
          color="purple"
        />
        <StatCard
          icon={Zap}
          title="Active Users"
          value="2,847"
          change={23.1}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Trends</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="campaigns" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {analytics.statusData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Metrics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Resource Usage</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {usageData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="text-gray-900 font-medium">
                    {item.name === 'Storage' ? `${item.usage}GB` : item.usage} / {item.name === 'Storage' ? `${item.limit}GB` : item.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (item.usage / item.limit) > 0.8 ? 'bg-red-500' :
                      (item.usage / item.limit) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(item.usage / item.limit) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.campaignsInRange.slice(0, 6).map((campaign, index) => (
              <div key={campaign.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  campaign.status === 'COMPLETED' ? 'bg-green-500' :
                  campaign.status === 'PROCESSING' ? 'bg-blue-500' :
                  campaign.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Campaign #{campaign.id.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  campaign.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                  campaign.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}