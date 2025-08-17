'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Eye, Heart, MessageCircle, Share2, 
  Calendar, Clock, Target, Zap, BarChart3, Activity,
  Facebook, RefreshCw, Settings, ExternalLink, AlertCircle,
  CheckCircle, Loader2
} from 'lucide-react';
import { 
  facebookSDK, 
  FacebookPageInfo, 
  FacebookInsights, 
  FacebookPost,
  socialMediaOptimizer 
} from '@/utils/facebookSDK';
import { format, subDays } from 'date-fns';

interface FacebookAnalyticsProps {
  campaignId?: string;
  campaignContent?: string;
}

export default function FacebookAnalytics({ campaignId, campaignContent }: FacebookAnalyticsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<FacebookPageInfo[]>([]);
  const [selectedPage, setSelectedPage] = useState<FacebookPageInfo | null>(null);
  const [insights, setInsights] = useState<FacebookInsights | null>(null);
  const [recentPosts, setRecentPosts] = useState<FacebookPost[]>([]);
  const [optimizedContent, setOptimizedContent] = useState<string>('');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [postingSchedule, setPostingSchedule] = useState(socialMediaOptimizer.getBestPostingTimes());
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeFacebook();
  }, []);

  useEffect(() => {
    if (campaignContent) {
      const optimized = socialMediaOptimizer.optimizeForFacebook(campaignContent);
      const hashtags = socialMediaOptimizer.suggestHashtags(campaignContent);
      setOptimizedContent(optimized);
      setSuggestedHashtags(hashtags);
    }
  }, [campaignContent]);

  const initializeFacebook = async () => {
    try {
      await facebookSDK.initialize(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '');
      const status = await facebookSDK.getLoginStatus();
      
      if (status.status === 'connected') {
        setIsConnected(true);
        await loadUserPages();
      }
    } catch (error) {
      console.error('Facebook initialization failed:', error);
      setError('Failed to initialize Facebook SDK');
    } finally {
      setLoading(false);
    }
  };

  const connectFacebook = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await facebookSDK.login();
      setIsConnected(true);
      await loadUserPages();
    } catch (error) {
      setError('Failed to connect to Facebook. Please try again.');
      console.error('Facebook login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPages = async () => {
    try {
      const userPages = await facebookSDK.getUserPages();
      setPages(userPages);
      
      if (userPages.length > 0) {
        setSelectedPage(userPages[0]);
        await loadPageData(userPages[0]);
      }
    } catch (error) {
      setError('Failed to load Facebook pages');
      console.error('Load pages failed:', error);
    }
  };

  const loadPageData = async (page: FacebookPageInfo) => {
    try {
      setLoading(true);
      
      // Load page insights
      const pageInsights = await facebookSDK.getPageInsights(
        page.id,
        page.access_token,
        [
          'page_impressions',
          'page_impressions_unique',
          'page_engaged_users',
          'page_post_engagements',
          'page_fans'
        ],
        'day',
        format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        format(new Date(), 'yyyy-MM-dd')
      );

      setInsights(pageInsights);

      // Load recent posts
      const posts = await facebookSDK.getPagePosts(page.id, page.access_token, 10);
      setRecentPosts(posts);

    } catch (error) {
      setError('Failed to load page analytics');
      console.error('Load page data failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!selectedPage) return;
    
    setRefreshing(true);
    await loadPageData(selectedPage);
    setRefreshing(false);
  };

  const publishToFacebook = async () => {
    if (!selectedPage || !optimizedContent) return;

    try {
      setLoading(true);
      
      const postData = {
        message: `${optimizedContent}\n\n${suggestedHashtags.join(' ')}`,
        published: true
      };

      const result = await facebookSDK.publishPost(
        selectedPage.id,
        selectedPage.access_token,
        postData
      );

      alert('Post published successfully to Facebook!');
      await refreshData();
      
    } catch (error) {
      setError('Failed to publish post to Facebook');
      console.error('Publish failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center">
            <Facebook className="w-8 h-8 text-white mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Facebook Integration</h2>
              <p className="text-blue-100">Connect your Facebook account to unlock powerful analytics and posting features</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Facebook className="w-10 h-10 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Connect to Facebook
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get insights on reach, engagement, and performance. Publish your AI-generated content directly to Facebook.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Analytics</h4>
                <p className="text-xs text-gray-600">Track reach, impressions, and engagement</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Quick Publish</h4>
                <p className="text-xs text-gray-600">Post directly from Solara AI</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 text-sm">Optimization</h4>
                <p className="text-xs text-gray-600">AI-powered content suggestions</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Connection Failed</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}

            <button
              onClick={connectFacebook}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="w-5 h-5 mr-2" />
                  Connect Facebook Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Selection & Overview */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Facebook className="w-8 h-8 text-white mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Facebook Analytics</h2>
                <p className="text-blue-100">Monitor your social media performance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {selectedPage && (
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-white text-sm font-medium">{selectedPage.name}</div>
                  <div className="text-blue-100 text-xs">{selectedPage.category}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Selection */}
        {pages.length > 1 && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Select Facebook Page</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setSelectedPage(page);
                    loadPageData(page);
                  }}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    selectedPage?.id === page.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{page.name}</div>
                  <div className="text-sm text-gray-600">{page.category}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Overview */}
        {insights && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">7-Day Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">REACH</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(insights.page_impressions_unique)}</div>
                <div className="text-sm text-gray-600">Unique users reached</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">IMPRESSIONS</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(insights.page_impressions)}</div>
                <div className="text-sm text-gray-600">Total impressions</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">ENGAGEMENT</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(insights.page_engaged_users)}</div>
                <div className="text-sm text-gray-600">Engaged users</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">INTERACTIONS</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(insights.page_post_engagements)}</div>
                <div className="text-sm text-gray-600">Post engagements</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <span className="text-xs text-cyan-600 font-medium">FOLLOWERS</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(insights.page_fans || 0)}</div>
                <div className="text-sm text-gray-600">Total followers</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Optimization & Publishing */}
      {campaignContent && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
            <h3 className="text-xl font-bold text-white mb-1">Facebook Post Optimization</h3>
            <p className="text-emerald-100">AI-optimized content ready for Facebook</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Optimized Content */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Optimized Content</h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-gray-700 leading-relaxed">{optimizedContent}</div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {suggestedHashtags.map((hashtag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <strong>Character count:</strong> {optimizedContent.length} (optimal for Facebook)
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Hashtags:</strong> {suggestedHashtags.length} suggested
                </div>
              </div>
              
              <button
                onClick={publishToFacebook}
                disabled={loading || !selectedPage}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Facebook className="w-5 h-5 mr-2" />
                    Publish to Facebook
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Performance */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-6">
            <h3 className="text-xl font-bold text-white mb-1">Recent Posts Performance</h3>
            <p className="text-violet-100">Track your latest content engagement</p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <p className="text-gray-700 line-clamp-2">{post.message || 'No message'}</p>
                      <div className="text-sm text-gray-500 mt-1">
                        {format(new Date(post.created_time), 'MMM d, yyyy')}
                      </div>
                    </div>
                    
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{post.engagement.reactions}</span>
                      </div>
                      <div className="text-xs text-gray-600">Reactions</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{post.engagement.comments}</span>
                      </div>
                      <div className="text-xs text-gray-600">Comments</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Share2 className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{post.engagement.shares}</span>
                      </div>
                      <div className="text-xs text-gray-600">Shares</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4 text-purple-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {((post.engagement.reactions + post.engagement.comments + post.engagement.shares) / 100 * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Best Posting Times */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <h3 className="text-xl font-bold text-white mb-1">Optimal Posting Schedule</h3>
          <p className="text-amber-100">Best times to reach your audience</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postingSchedule.map((day) => (
              <div key={day.day} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{day.day}</h4>
                <div className="space-y-1">
                  {day.times.map((time, index) => (
                    <div key={index} className="flex items-center">
                      <Clock className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm text-gray-700">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}