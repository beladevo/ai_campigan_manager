'use client';

import { useState } from 'react';
import { Campaign, CreateCampaignRequest, CampaignTemplate } from '@/types/campaign';
import { createCampaign } from '@/lib/api';
import { ShoppingBag, Share2, PenTool, Mail, Megaphone, Sparkles } from 'lucide-react';

const templates: CampaignTemplate[] = [
  {
    id: '1',
    name: 'Product Launch',
    description: 'Launch a new product with compelling copy and visuals',
    category: 'e-commerce',
    promptTemplate: 'Create an exciting product launch campaign for {productName}. Highlight key features: {features}. Target audience: {audience}.',
    icon: 'shopping-bag'
  },
  {
    id: '2',
    name: 'Social Media Post',
    description: 'Engaging social media content for your brand',
    category: 'social-media',
    promptTemplate: 'Create an engaging social media post about {topic}. Tone: {tone}. Include call-to-action for {cta}.',
    icon: 'share-2'
  },
  {
    id: '3',
    name: 'Blog Article',
    description: 'Professional blog content for your website',
    category: 'blog',
    promptTemplate: 'Write a comprehensive blog article about {topic}. Target keywords: {keywords}. Audience level: {level}.',
    icon: 'pen-tool'
  },
  {
    id: '4',
    name: 'Email Campaign',
    description: 'Effective email marketing content',
    category: 'email',
    promptTemplate: 'Create an email campaign for {campaign_type}. Subject line focus: {subject}. Key message: {message}.',
    icon: 'mail'
  },
  {
    id: '5',
    name: 'Advertisement Copy',
    description: 'High-converting ad copy for paid campaigns',
    category: 'ad-copy',
    promptTemplate: 'Create compelling ad copy for {platform}. Product/service: {offering}. Unique selling point: {usp}.',
    icon: 'megaphone'
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'shopping-bag': return <ShoppingBag className="w-6 h-6" />;
    case 'share-2': return <Share2 className="w-6 h-6" />;
    case 'pen-tool': return <PenTool className="w-6 h-6" />;
    case 'mail': return <Mail className="w-6 h-6" />;
    case 'megaphone': return <Megaphone className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

interface CampaignCreatorProps {
  onCampaignCreated: (campaign: Campaign) => void;
  userId: string;
}

export default function CampaignCreator({ onCampaignCreated, userId }: CampaignCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'customize'>('template');

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.promptTemplate);
    setStep('customize');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !userId.trim()) return;

    setIsLoading(true);
    try {
      const request: CreateCampaignRequest = {
        userId: userId.trim(),
        prompt: prompt.trim()
      };
      
      const campaign = await createCampaign(request);
      onCampaignCreated(campaign);
      
      setPrompt('');
      setSelectedTemplate(null);
      setStep('template');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedTemplate(null);
    setPrompt('');
    setStep('template');
  };

  if (step === 'template') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-10 animate-bounce-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Campaign Type</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a professionally crafted template or start from scratch with your own vision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {templates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="group p-8 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 text-left hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  {getIcon(template.icon)}
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h3>
                  <span className="text-sm text-indigo-500 capitalize font-medium bg-indigo-50 px-2 py-1 rounded-full">
                    {template.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                {template.description}
              </p>
              <div className="mt-4 text-indigo-500 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Click to customize →
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-10">
          <button
            onClick={() => setStep('customize')}
            className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group hover-lift"
          >
            <div className="flex items-center justify-center">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 mr-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-gray-700 font-bold text-lg block group-hover:text-indigo-600 transition-colors">
                  Create Custom Campaign
                </span>
                <span className="text-gray-500 text-sm block group-hover:text-indigo-500 transition-colors">
                  Start with a blank canvas and unleash your creativity
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-10 animate-slide-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Campaign</span>
          </h2>
          {selectedTemplate && (
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                {getIcon(selectedTemplate.icon)}
              </div>
              <p className="text-indigo-600 font-semibold">
                Using template: <span className="text-indigo-700">{selectedTemplate.name}</span>
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleStartOver}
          className="px-6 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 font-medium"
        >
          ← Choose Different Template
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="prompt" className="block text-lg font-semibold text-gray-800 mb-4">
            Campaign Description
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
              placeholder="Describe your campaign in detail. Include target audience, key messages, tone, and any specific requirements. The more specific you are, the better the AI-generated content will be..."
              required
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-400 font-medium">
              {prompt.length}/2000
            </div>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-700 font-medium flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Pro Tip: Be specific about your goals, target audience, and desired tone for best results.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
            isLoading || !prompt.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="enhanced-spinner mr-4"></div>
              <div>
                <div className="text-xl mb-1">✨ Creating Your Campaign...</div>
                <div className="text-sm opacity-80">AI is crafting your content and visuals</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 mr-3 animate-pulse-soft" />
              <span>Generate My Campaign</span>
            </div>
          )}
        </button>

        {isLoading && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <p className="text-center text-indigo-700 font-medium">
              Our AI is analyzing your requirements and generating professional marketing content...
            </p>
          </div>
        )}
      </form>
    </div>
  );
}