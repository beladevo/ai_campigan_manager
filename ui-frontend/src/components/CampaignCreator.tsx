'use client';

import { useState } from 'react';
import { Campaign, CreateCampaignRequest, CampaignTemplate } from '@/types/campaign';
import { createCampaign } from '@/lib/api';
import { 
  ShoppingBag, Share2, PenTool, Mail, Megaphone, Sparkles, 
  ArrowLeft, ArrowRight, Check, Zap, Target, Users, Palette,
  ChevronRight, FileText, Settings, Rocket, Play
} from 'lucide-react';

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
  usage?: {
    campaignsUsedThisMonth: number;
    subscriptionTier: string;
    canCreateCampaign: boolean;
  } | null;
}

export default function CampaignCreator({ onCampaignCreated, usage }: CampaignCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'details' | 'audience' | 'review' | 'generating'>('template');
  const [campaignDetails, setCampaignDetails] = useState({
    title: '',
    objective: '',
    tone: 'professional',
    targetAudience: '',
    keyMessages: '',
    callToAction: '',
  });

  const steps = [
    { id: 'template', title: 'Template', icon: FileText, description: 'Choose your campaign type' },
    { id: 'details', title: 'Details', icon: Settings, description: 'Campaign specifics' },
    { id: 'audience', title: 'Audience', icon: Users, description: 'Target & messaging' },
    { id: 'review', title: 'Review', icon: Check, description: 'Final check' },
    { id: 'generating', title: 'Generate', icon: Rocket, description: 'AI creation' },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === step);
  const isStepCompleted = (stepId: string) => getCurrentStepIndex() > steps.findIndex(s => s.id === stepId);

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setCampaignDetails(prev => ({ ...prev, title: template.name }));
    setStep('details');
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id as any);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id as any);
    }
  };

  const generateFinalPrompt = () => {
    const templateBase = selectedTemplate?.promptTemplate || '';
    return `${templateBase}

Campaign Title: ${campaignDetails.title}
Objective: ${campaignDetails.objective}
Tone: ${campaignDetails.tone}
Target Audience: ${campaignDetails.targetAudience}
Key Messages: ${campaignDetails.keyMessages}
Call to Action: ${campaignDetails.callToAction}

Please create compelling marketing content based on these specifications.`;
  };

  const handleSubmit = async () => {
    // Check usage quota
    if (usage && !usage.canCreateCampaign) {
      alert('You have reached your monthly campaign limit. Please upgrade your subscription to create more campaigns.');
      return;
    }

    setStep('generating');
    setIsLoading(true);
    
    try {
      const finalPrompt = generateFinalPrompt();
      const request: Omit<CreateCampaignRequest, 'userId'> = {
        prompt: finalPrompt
      };
      
      const campaign = await createCampaign(request);
      onCampaignCreated(campaign);
      
      // Reset form
      setPrompt('');
      setSelectedTemplate(null);
      setCampaignDetails({
        title: '',
        objective: '',
        tone: 'professional',
        targetAudience: '',
        keyMessages: '',
        callToAction: '',
      });
      setStep('template');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
      setStep('review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedTemplate(null);
    setPrompt('');
    setCampaignDetails({
      title: '',
      objective: '',
      tone: 'professional',
      targetAudience: '',
      keyMessages: '',
      callToAction: '',
    });
    setStep('template');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Campaign Wizard</h1>
          <button
            onClick={handleStartOver}
            className="text-white/80 hover:text-white text-sm flex items-center space-x-1 hover:bg-white/20 px-3 py-1 rounded-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start Over</span>
          </button>
        </div>
        
        {/* Step Progress Bar */}
        <div className="flex items-center space-x-4">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === stepItem.id;
            const isCompleted = isStepCompleted(stepItem.id);
            
            return (
              <div key={stepItem.id} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-violet-500 shadow-lg scale-110' 
                      : isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-semibold ${isActive || isCompleted ? 'text-white' : 'text-white/60'}`}>
                      {stepItem.title}
                    </div>
                    <div className={`text-xs ${isActive || isCompleted ? 'text-white/80' : 'text-white/40'}`}>
                      {stepItem.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* Usage indicator */}
        {usage && (
          <div className="mt-4 flex items-center justify-between bg-white/10 rounded-full px-4 py-2">
            <span className="text-white/80 text-sm">Monthly usage:</span>
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">
                {usage.campaignsUsedThisMonth} / {usage.subscriptionTier === 'enterprise' ? '∞' : 
                  usage.subscriptionTier === 'business' ? '200' :
                  usage.subscriptionTier === 'premium' ? '50' : '5'}
              </span>
              {!usage.canCreateCampaign && (
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  Limit reached
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="p-8">
        {step === 'template' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Campaign Type
              </h2>
              <p className="text-gray-600 text-lg">
                Select a professionally crafted template to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group p-6 border-2 border-gray-200 rounded-2xl hover:border-violet-300 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl group-hover:from-violet-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                      {getIcon(template.icon)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                        {template.name}
                      </h3>
                      <span className="text-xs text-violet-500 bg-violet-50 px-2 py-1 rounded-full">
                        {template.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setStep('details')}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-gray-400 group-hover:text-violet-500 mr-3 transition-colors" />
                  <div>
                    <div className="font-bold text-gray-700 group-hover:text-violet-600 transition-colors">
                      Create Custom Campaign
                    </div>
                    <div className="text-sm text-gray-500">
                      Start with a blank canvas
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Campaign Details
              </h2>
              <p className="text-gray-600 text-lg">
                Tell us about your campaign specifics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={campaignDetails.title}
                  onChange={(e) => setCampaignDetails(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Spring Product Launch"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  value={campaignDetails.tone}
                  onChange={(e) => setCampaignDetails(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="playful">Playful</option>
                  <option value="urgent">Urgent</option>
                  <option value="luxury">Luxury</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Campaign Objective *
              </label>
              <textarea
                value={campaignDetails.objective}
                onChange={(e) => setCampaignDetails(prev => ({ ...prev, objective: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none bg-white text-gray-900 placeholder-gray-500"
                placeholder="What do you want to achieve with this campaign?"
                required
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!campaignDetails.title || !campaignDetails.objective}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'audience' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Target Audience & Messaging
              </h2>
              <p className="text-gray-600 text-lg">
                Define your audience and key messages
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Audience *
                </label>
                <textarea
                  value={campaignDetails.targetAudience}
                  onChange={(e) => setCampaignDetails(prev => ({ ...prev, targetAudience: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Describe your target audience: demographics, interests, pain points..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Messages
                </label>
                <textarea
                  value={campaignDetails.keyMessages}
                  onChange={(e) => setCampaignDetails(prev => ({ ...prev, keyMessages: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none bg-white text-gray-900 placeholder-gray-500"
                  placeholder="What are the main points you want to communicate?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Call to Action
                </label>
                <input
                  type="text"
                  value={campaignDetails.callToAction}
                  onChange={(e) => setCampaignDetails(prev => ({ ...prev, callToAction: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all bg-white text-gray-900 placeholder-gray-500"
                  placeholder="e.g., Shop Now, Learn More, Sign Up Today..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!campaignDetails.targetAudience}
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Review Your Campaign
              </h2>
              <p className="text-gray-600 text-lg">
                Double-check everything before we generate your content
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              {selectedTemplate && (
                <div className="flex items-center p-4 bg-white rounded-xl">
                  <div className="p-2 bg-violet-100 rounded-lg mr-3">
                    {getIcon(selectedTemplate.icon)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Template</div>
                    <div className="text-gray-600">{selectedTemplate.name}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl">
                  <div className="font-semibold text-gray-900 mb-2">Campaign Title</div>
                  <div className="text-gray-600">{campaignDetails.title || 'Not specified'}</div>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <div className="font-semibold text-gray-900 mb-2">Tone</div>
                  <div className="text-gray-600 capitalize">{campaignDetails.tone}</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl">
                <div className="font-semibold text-gray-900 mb-2">Objective</div>
                <div className="text-gray-600">{campaignDetails.objective || 'Not specified'}</div>
              </div>

              <div className="p-4 bg-white rounded-xl">
                <div className="font-semibold text-gray-900 mb-2">Target Audience</div>
                <div className="text-gray-600">{campaignDetails.targetAudience || 'Not specified'}</div>
              </div>

              {campaignDetails.keyMessages && (
                <div className="p-4 bg-white rounded-xl">
                  <div className="font-semibold text-gray-900 mb-2">Key Messages</div>
                  <div className="text-gray-600">{campaignDetails.keyMessages}</div>
                </div>
              )}

              {campaignDetails.callToAction && (
                <div className="p-4 bg-white rounded-xl">
                  <div className="font-semibold text-gray-900 mb-2">Call to Action</div>
                  <div className="text-gray-600">{campaignDetails.callToAction}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-semibold"
              >
                <Rocket className="w-5 h-5" />
                <span>Generate Campaign</span>
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ✨ Creating Your Campaign
              </h2>
              <p className="text-gray-600 text-lg">
                Our AI is crafting your content and visuals...
              </p>
            </div>

            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
              <p className="text-violet-700 font-medium">
                🎯 Analyzing your requirements and generating professional marketing content...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}