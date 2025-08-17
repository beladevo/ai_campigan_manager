// Facebook SDK integration for Solara AI
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
}

export interface FacebookInsights {
  page_impressions: number;
  page_impressions_unique: number;
  page_engaged_users: number;
  page_post_engagements: number;
  page_fans: number;
  page_fans_online: number;
}

export interface FacebookPostInsights {
  post_impressions: number;
  post_impressions_unique: number;
  post_engaged_users: number;
  post_clicks: number;
  post_reactions_like_total: number;
  post_reactions_love_total: number;
  post_reactions_wow_total: number;
  post_reactions_haha_total: number;
  post_reactions_sorry_total: number;
  post_reactions_anger_total: number;
  post_video_views?: number;
  post_video_view_time?: number;
}

export interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
  insights?: FacebookPostInsights;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reactions: number;
  };
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
  amount_spent: string;
}

class FacebookSDKManager {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(appId: string): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Load Facebook SDK
        if (!document.getElementById('facebook-jssdk')) {
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        window.fbAsyncInit = () => {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });

          this.isInitialized = true;
          resolve();
        };

        // Fallback timeout
        setTimeout(() => {
          if (!this.isInitialized) {
            reject(new Error('Facebook SDK initialization timeout'));
          }
        }, 10000);

      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  }

  async login(scope: string = 'pages_manage_posts,pages_read_engagement,pages_show_list,ads_management,ads_read'): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('Facebook login failed or cancelled'));
        }
      }, { scope });
    });
  }

  async getLoginStatus(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve) => {
      window.FB.getLoginStatus((response: any) => {
        resolve(response);
      });
    });
  }

  async logout(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve) => {
      window.FB.logout(() => {
        resolve();
      });
    });
  }

  async getUserPages(): Promise<FacebookPageInfo[]> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.api('/me/accounts', (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.data || []);
        }
      });
    });
  }

  async getPageInsights(pageId: string, accessToken: string, metric: string[], period: string = 'day', since?: string, until?: string): Promise<FacebookInsights> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    const params: any = {
      metric: metric.join(','),
      period,
      access_token: accessToken
    };

    if (since) params.since = since;
    if (until) params.until = until;

    return new Promise((resolve, reject) => {
      window.FB.api(`/${pageId}/insights`, params, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          // Transform the response into a more usable format
          const insights: any = {};
          response.data.forEach((item: any) => {
            insights[item.name] = item.values[0]?.value || 0;
          });
          resolve(insights);
        }
      });
    });
  }

  async publishPost(pageId: string, accessToken: string, postData: {
    message: string;
    link?: string;
    picture?: string;
    name?: string;
    caption?: string;
    description?: string;
    scheduled_publish_time?: number;
    published?: boolean;
  }): Promise<{ id: string; post_id: string }> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.api(`/${pageId}/feed`, 'POST', {
        ...postData,
        access_token: accessToken
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  async getPostInsights(postId: string, accessToken: string): Promise<FacebookPostInsights> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    const metrics = [
      'post_impressions',
      'post_impressions_unique', 
      'post_engaged_users',
      'post_clicks',
      'post_reactions_like_total',
      'post_reactions_love_total',
      'post_reactions_wow_total',
      'post_reactions_haha_total',
      'post_reactions_sorry_total',
      'post_reactions_anger_total'
    ];

    return new Promise((resolve, reject) => {
      window.FB.api(`/${postId}/insights`, {
        metric: metrics.join(','),
        access_token: accessToken
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          const insights: any = {};
          response.data.forEach((item: any) => {
            insights[item.name] = item.values[0]?.value || 0;
          });
          resolve(insights);
        }
      });
    });
  }

  async getAdAccounts(): Promise<FacebookAdAccount[]> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.api('/me/adaccounts', {
        fields: 'id,name,account_status,currency,timezone_name,amount_spent'
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.data || []);
        }
      });
    });
  }

  async createAdCampaign(adAccountId: string, campaignData: {
    name: string;
    objective: string;
    status: 'ACTIVE' | 'PAUSED';
    buying_type?: 'AUCTION' | 'RESERVED';
    daily_budget?: number;
    lifetime_budget?: number;
  }): Promise<{ id: string }> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.api(`/act_${adAccountId}/campaigns`, 'POST', campaignData, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  async getPagePosts(pageId: string, accessToken: string, limit: number = 25): Promise<FacebookPost[]> {
    if (!this.isInitialized) {
      throw new Error('Facebook SDK not initialized');
    }

    return new Promise((resolve, reject) => {
      window.FB.api(`/${pageId}/posts`, {
        fields: 'id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true),shares,reactions.summary(true)',
        limit,
        access_token: accessToken
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          const posts = response.data.map((post: any) => ({
            id: post.id,
            message: post.message || '',
            created_time: post.created_time,
            permalink_url: post.permalink_url,
            full_picture: post.full_picture,
            engagement: {
              likes: post.likes?.summary?.total_count || 0,
              comments: post.comments?.summary?.total_count || 0,
              shares: post.shares?.count || 0,
              reactions: post.reactions?.summary?.total_count || 0
            }
          }));
          resolve(posts);
        }
      });
    });
  }
}

export const facebookSDK = new FacebookSDKManager();

// Utility functions for social media optimization
export const socialMediaOptimizer = {
  optimizeForFacebook: (content: string, maxLength: number = 300): string => {
    if (content.length <= maxLength) return content;
    
    // Find the best place to cut off without breaking words
    const truncated = content.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return (lastSpace > maxLength * 0.8 ? truncated.substring(0, lastSpace) : truncated) + '...';
  },

  extractHashtags: (content: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return content.match(hashtagRegex) || [];
  },

  suggestHashtags: (content: string, category: string = 'marketing'): string[] => {
    const suggestions: { [key: string]: string[] } = {
      marketing: ['#marketing', '#digitalmarketing', '#contentmarketing', '#socialmedia', '#branding'],
      product: ['#product', '#innovation', '#launch', '#newproduct', '#quality'],
      ecommerce: ['#ecommerce', '#shopping', '#sale', '#discount', '#deal'],
      business: ['#business', '#entrepreneur', '#success', '#growth', '#leadership'],
      technology: ['#technology', '#tech', '#innovation', '#digital', '#ai']
    };

    return suggestions[category.toLowerCase()] || suggestions.marketing;
  },

  getBestPostingTimes: (): { day: string; times: string[] }[] => {
    return [
      { day: 'Monday', times: ['9:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Tuesday', times: ['9:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Wednesday', times: ['9:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Friday', times: ['10:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Saturday', times: ['10:00 AM', '12:00 PM', '2:00 PM'] },
      { day: 'Sunday', times: ['11:00 AM', '1:00 PM', '4:00 PM'] }
    ];
  }
};

// Environment variable helpers
export const getFacebookAppId = (): string => {
  return process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';
};

export const initializeFacebookSDK = async (): Promise<void> => {
  const appId = getFacebookAppId();
  if (!appId) {
    throw new Error('Facebook App ID not configured');
  }
  return facebookSDK.initialize(appId);
};