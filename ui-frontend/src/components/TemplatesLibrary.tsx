'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Copy, 
  Eye, 
  ShoppingCart, 
  Mail, 
  MessageSquare,
  Megaphone,
  FileText,
  Zap,
  Users,
  TrendingUp,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { CampaignTemplate } from '@/types/campaign';

interface TemplatesLibraryProps {
  onSelectTemplate: (template: CampaignTemplate) => void;
}

export default function TemplatesLibrary({ onSelectTemplate }: TemplatesLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText, count: 24 },
    { id: 'e-commerce', name: 'E-Commerce', icon: ShoppingCart, count: 8 },
    { id: 'social-media', name: 'Social Media', icon: MessageSquare, count: 6 },
    { id: 'email', name: 'Email Marketing', icon: Mail, count: 5 },
    { id: 'ad-copy', name: 'Ad Copy', icon: Megaphone, count: 5 }
  ];

  const templates: CampaignTemplate[] = [
    // E-Commerce Templates
    {
      id: 'ecom-product-launch',
      name: 'Product Launch Campaign',
      description: 'Generate compelling copy for new product launches with features, benefits, and CTAs',
      category: 'e-commerce',
      promptTemplate: 'Create a product launch campaign for {product_name}. Key features: {features}. Target audience: {audience}. Tone: {tone}. Include benefits, social proof, and strong CTA.',
      icon: '🚀',
      rating: 4.9,
      uses: 1247,
      tags: ['launch', 'product', 'features', 'benefits']
    },
    {
      id: 'ecom-seasonal-sale',
      name: 'Seasonal Sale Promo',
      description: 'Create urgency-driven copy for seasonal sales and limited-time offers',
      category: 'e-commerce',
      promptTemplate: 'Write compelling copy for a {season} sale. Products: {products}. Discount: {discount}%. Duration: {duration}. Create urgency and highlight savings.',
      icon: '🔥',
      rating: 4.8,
      uses: 892,
      tags: ['sale', 'urgency', 'seasonal', 'discount']
    },
    {
      id: 'ecom-abandoned-cart',
      name: 'Cart Recovery Email',
      description: 'Win back customers with personalized abandoned cart recovery emails',
      category: 'e-commerce',
      promptTemplate: 'Create an abandoned cart recovery email for {customer_name}. Items: {cart_items}. Offer: {incentive}. Make it personal and compelling.',
      icon: '🛒',
      rating: 4.7,
      uses: 654,
      tags: ['recovery', 'email', 'personalized', 'incentive']
    },

    // Social Media Templates
    {
      id: 'social-viral-post',
      name: 'Viral Social Post',
      description: 'Create engaging, shareable content designed to go viral on social platforms',
      category: 'social-media',
      promptTemplate: 'Write a viral {platform} post about {topic}. Tone: {tone}. Include hook, value, and call-to-action. Make it shareable and engaging.',
      icon: '📱',
      rating: 4.6,
      uses: 2145,
      tags: ['viral', 'engagement', 'shareable', 'hook']
    },
    {
      id: 'social-story-content',
      name: 'Instagram Story Series',
      description: 'Multi-slide story content that keeps viewers engaged and coming back',
      category: 'social-media',
      promptTemplate: 'Create a {slides}-slide Instagram story series about {topic}. Theme: {theme}. Include interactive elements and strong visuals cues.',
      icon: '📚',
      rating: 4.5,
      uses: 789,
      tags: ['stories', 'series', 'interactive', 'visual']
    },
    {
      id: 'social-community-post',
      name: 'Community Engagement',
      description: 'Build stronger community connections with discussion-starting posts',
      category: 'social-media',
      promptTemplate: 'Write a community engagement post for {niche}. Topic: {discussion_topic}. Encourage responses and build connections.',
      icon: '💬',
      rating: 4.4,
      uses: 567,
      tags: ['community', 'discussion', 'engagement', 'connection']
    },

    // Email Marketing Templates
    {
      id: 'email-welcome-series',
      name: 'Welcome Email Series',
      description: 'Onboard new subscribers with a compelling welcome email sequence',
      category: 'email',
      promptTemplate: 'Create email {email_number} of a welcome series for {business_type}. Introduce {value_proposition}. Next step: {next_action}.',
      icon: '👋',
      rating: 4.8,
      uses: 1034,
      tags: ['welcome', 'onboarding', 'series', 'value']
    },
    {
      id: 'email-newsletter',
      name: 'Weekly Newsletter',
      description: 'Keep subscribers engaged with valuable weekly newsletter content',
      category: 'email',
      promptTemplate: 'Write a weekly newsletter for {industry}. Topics: {topics}. Include insights, tips, and {call_to_action}. Keep it valuable and concise.',
      icon: '📧',
      rating: 4.7,
      uses: 823,
      tags: ['newsletter', 'weekly', 'insights', 'tips']
    },
    {
      id: 'email-re-engagement',
      name: 'Win-Back Campaign',
      description: 'Re-engage inactive subscribers with compelling comeback offers',
      category: 'email',
      promptTemplate: 'Create a win-back email for inactive subscribers. Last activity: {timeframe}. Offer: {incentive}. Make them remember why they subscribed.',
      icon: '💝',
      rating: 4.6,
      uses: 445,
      tags: ['win-back', 'inactive', 'incentive', 'remember']
    },

    // Ad Copy Templates
    {
      id: 'ad-facebook-conversion',
      name: 'Facebook Conversion Ad',
      description: 'High-converting Facebook ad copy optimized for conversions',
      category: 'ad-copy',
      promptTemplate: 'Write Facebook ad copy for {product/service}. Target: {target_audience}. Goal: {conversion_goal}. Include hook, benefits, and strong CTA.',
      icon: '🎯',
      rating: 4.9,
      uses: 1567,
      tags: ['facebook', 'conversion', 'hook', 'benefits']
    },
    {
      id: 'ad-google-search',
      name: 'Google Search Ad',
      description: 'Compelling Google Ads copy that captures search intent',
      category: 'ad-copy',
      promptTemplate: 'Create Google Search ad for keyword "{keyword}". Service: {service}. USP: {unique_selling_point}. Include compelling headline and description.',
      icon: '🔍',
      rating: 4.8,
      uses: 987,
      tags: ['google', 'search', 'keyword', 'USP']
    },
    {
      id: 'ad-linkedin-b2b',
      name: 'LinkedIn B2B Campaign',
      description: 'Professional LinkedIn ad copy for B2B lead generation',
      category: 'ad-copy',
      promptTemplate: 'Write LinkedIn B2B ad for {service}. Target: {job_title} at {company_size} companies. Problem: {pain_point}. Solution: {solution}.',
      icon: '💼',
      rating: 4.7,
      uses: 654,
      tags: ['linkedin', 'b2b', 'professional', 'lead-gen']
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Templates</h1>
          <p className="text-gray-600 mt-1">Choose from our library of proven campaign templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{category.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map(template => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{template.icon}</div>
                      <div className="flex items-center">
                        <CategoryIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {template.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${favorites.has(template.id) ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{template.uses.toLocaleString()} uses</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Use Template
                    </button>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}