export interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt: string;
  icon: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  targetAudience: string;
  previewImage?: string;
}

export const campaignTemplates: CampaignTemplate[] = [
  // SOCIAL MEDIA TEMPLATES
  {
    id: 'sm-product-launch',
    name: 'Product Launch Announcement',
    category: 'Social Media',
    description: 'Generate exciting product launch content for social media platforms',
    prompt: 'Create a compelling product launch announcement for social media. Include: an attention-grabbing headline, key product benefits, launch date excitement, early bird offers, and strong call-to-action. Make it shareable and engaging with emojis and hashtags.',
    icon: '🚀',
    tags: ['product launch', 'social media', 'announcement', 'excitement'],
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
    targetAudience: 'General consumers, early adopters',
  },
  {
    id: 'sm-behind-scenes',
    name: 'Behind-the-Scenes Story',
    category: 'Social Media',
    description: 'Share authentic behind-the-scenes content to build brand connection',
    prompt: 'Create behind-the-scenes content that showcases our company culture, team, or process. Include authentic storytelling, team highlights, work environment details, and values demonstration. Make it relatable and humanize the brand.',
    icon: '🎬',
    tags: ['behind the scenes', 'authenticity', 'team', 'culture'],
    difficulty: 'intermediate',
    estimatedTime: '3-4 minutes',
    targetAudience: 'Brand enthusiasts, potential employees',
  },
  {
    id: 'sm-user-testimonial',
    name: 'Customer Success Story',
    category: 'Social Media',
    description: 'Highlight customer success stories and testimonials',
    prompt: 'Create a customer success story post featuring real results and testimonials. Include customer challenges, solutions provided, specific results achieved, emotional impact, and credibility elements. Make it inspiring and trustworthy.',
    icon: '⭐',
    tags: ['testimonial', 'success story', 'social proof', 'results'],
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
    targetAudience: 'Potential customers, prospects',
  },

  // EMAIL MARKETING TEMPLATES
  {
    id: 'email-welcome-series',
    name: 'Welcome Email Sequence',
    category: 'Email Marketing',
    description: 'Create a warm welcome email for new subscribers',
    prompt: 'Write a welcoming email for new subscribers. Include warm greeting, brand introduction, what to expect, exclusive welcome offer, next steps, and contact information. Make it personal and value-driven.',
    icon: '📧',
    tags: ['welcome email', 'onboarding', 'subscribers', 'relationship building'],
    difficulty: 'beginner',
    estimatedTime: '3-4 minutes',
    targetAudience: 'New subscribers, leads',
  },
  {
    id: 'email-promotional',
    name: 'Promotional Campaign',
    category: 'Email Marketing',
    description: 'Create compelling promotional email content',
    prompt: 'Design a promotional email campaign for a special offer. Include compelling subject line, offer details, urgency elements, clear benefits, customer testimonials, and strong call-to-action. Make it conversion-focused.',
    icon: '🎯',
    tags: ['promotion', 'offers', 'conversion', 'urgency'],
    difficulty: 'intermediate',
    estimatedTime: '4-5 minutes',
    targetAudience: 'Existing customers, prospects',
  },
  {
    id: 'email-newsletter',
    name: 'Newsletter Content',
    category: 'Email Marketing',
    description: 'Generate engaging newsletter content',
    prompt: 'Create newsletter content including industry insights, company updates, valuable tips, featured content, upcoming events, and community highlights. Make it informative and engaging.',
    icon: '📰',
    tags: ['newsletter', 'updates', 'insights', 'community'],
    difficulty: 'advanced',
    estimatedTime: '5-6 minutes',
    targetAudience: 'Subscribers, community members',
  },

  // WEBSITE COPY TEMPLATES
  {
    id: 'web-homepage-hero',
    name: 'Homepage Hero Section',
    category: 'Website Copy',
    description: 'Create compelling homepage hero content',
    prompt: 'Write a powerful homepage hero section including attention-grabbing headline, clear value proposition, key benefits, trust indicators, and compelling call-to-action. Make it conversion-optimized and brand-aligned.',
    icon: '🏠',
    tags: ['homepage', 'hero section', 'value proposition', 'conversion'],
    difficulty: 'advanced',
    estimatedTime: '4-5 minutes',
    targetAudience: 'Website visitors, prospects',
  },
  {
    id: 'web-about-page',
    name: 'About Us Page',
    category: 'Website Copy',
    description: 'Tell your brand story compellingly',
    prompt: 'Create an engaging About Us page including company story, mission and values, team introduction, achievements and milestones, and what makes you unique. Make it authentic and trust-building.',
    icon: '👥',
    tags: ['about us', 'brand story', 'mission', 'team'],
    difficulty: 'intermediate',
    estimatedTime: '5-6 minutes',
    targetAudience: 'Website visitors, potential partners',
  },
  {
    id: 'web-landing-page',
    name: 'Landing Page Copy',
    category: 'Website Copy',
    description: 'Create high-converting landing page content',
    prompt: 'Write landing page copy for a specific campaign. Include compelling headline, problem identification, solution presentation, benefits and features, social proof, objection handling, and clear call-to-action. Make it conversion-focused.',
    icon: '📄',
    tags: ['landing page', 'conversion', 'campaign', 'sales'],
    difficulty: 'advanced',
    estimatedTime: '6-7 minutes',
    targetAudience: 'Campaign targets, prospects',
  },

  // ADVERTISING TEMPLATES
  {
    id: 'ad-google-search',
    name: 'Google Ads Copy',
    category: 'Advertising',
    description: 'Create effective Google Ads text',
    prompt: 'Write Google Ads copy including compelling headlines, descriptive ad text, key benefits, unique selling points, and strong call-to-action. Include ad extensions suggestions. Make it click-worthy and relevant.',
    icon: '🔍',
    tags: ['google ads', 'ppc', 'search marketing', 'clicks'],
    difficulty: 'intermediate',
    estimatedTime: '3-4 minutes',
    targetAudience: 'Search users, intent-driven prospects',
  },
  {
    id: 'ad-facebook-video',
    name: 'Facebook Video Ad Script',
    category: 'Advertising',
    description: 'Write engaging video ad scripts for Facebook',
    prompt: 'Create a Facebook video ad script including hook opening, problem introduction, solution presentation, benefits demonstration, social proof, and clear call-to-action. Make it engaging for mobile viewing.',
    icon: '📹',
    tags: ['facebook ads', 'video script', 'mobile', 'engagement'],
    difficulty: 'advanced',
    estimatedTime: '5-6 minutes',
    targetAudience: 'Social media users, video watchers',
  },
  {
    id: 'ad-display-banner',
    name: 'Display Ad Content',
    category: 'Advertising',
    description: 'Create attention-grabbing display ad content',
    prompt: 'Write display ad content including catchy headline, brief compelling description, key benefit highlight, and action-oriented call-to-action. Consider visual hierarchy and limited space. Make it attention-grabbing.',
    icon: '🖼️',
    tags: ['display ads', 'banner ads', 'visual', 'attention'],
    difficulty: 'beginner',
    estimatedTime: '2-3 minutes',
    targetAudience: 'Website visitors, retargeting audiences',
  },

  // CONTENT MARKETING TEMPLATES
  {
    id: 'content-blog-post',
    name: 'Blog Post Outline',
    category: 'Content Marketing',
    description: 'Generate comprehensive blog post content',
    prompt: 'Create a detailed blog post including engaging introduction, main points with examples, actionable tips, case studies or data, conclusion with key takeaways, and call-to-action. Make it SEO-friendly and valuable.',
    icon: '✍️',
    tags: ['blog post', 'content', 'SEO', 'value'],
    difficulty: 'advanced',
    estimatedTime: '7-10 minutes',
    targetAudience: 'Blog readers, organic traffic',
  },
  {
    id: 'content-whitepaper',
    name: 'Whitepaper Introduction',
    category: 'Content Marketing',
    description: 'Create authoritative whitepaper content',
    prompt: 'Write whitepaper content including executive summary, problem analysis, solution framework, research insights, implementation guidance, and conclusions. Make it authoritative and professionally detailed.',
    icon: '📊',
    tags: ['whitepaper', 'research', 'authority', 'B2B'],
    difficulty: 'advanced',
    estimatedTime: '10-15 minutes',
    targetAudience: 'Decision makers, industry professionals',
  },
  {
    id: 'content-case-study',
    name: 'Case Study Content',
    category: 'Content Marketing',
    description: 'Document success stories and results',
    prompt: 'Create a comprehensive case study including client background, challenges faced, solution implemented, results achieved, and lessons learned. Include specific metrics and testimonials. Make it credible and detailed.',
    icon: '📈',
    tags: ['case study', 'success story', 'metrics', 'proof'],
    difficulty: 'advanced',
    estimatedTime: '8-10 minutes',
    targetAudience: 'Prospects, decision makers',
  },

  // E-COMMERCE TEMPLATES
  {
    id: 'ecom-product-description',
    name: 'Product Description',
    category: 'E-commerce',
    description: 'Write compelling product descriptions',
    prompt: 'Create product descriptions including key features, benefits, specifications, use cases, customer reviews integration, and buying motivation. Address common questions and concerns. Make it sales-focused.',
    icon: '🛍️',
    tags: ['product description', 'e-commerce', 'sales', 'features'],
    difficulty: 'intermediate',
    estimatedTime: '3-4 minutes',
    targetAudience: 'Online shoppers, product researchers',
  },
  {
    id: 'ecom-abandoned-cart',
    name: 'Abandoned Cart Email',
    category: 'E-commerce',
    description: 'Recover abandoned shopping carts',
    prompt: 'Write abandoned cart recovery email including gentle reminder, product highlights, urgency elements, incentives or offers, easy checkout process, and customer support. Make it persuasive but not pushy.',
    icon: '🛒',
    tags: ['abandoned cart', 'recovery', 'e-commerce', 'conversion'],
    difficulty: 'intermediate',
    estimatedTime: '4-5 minutes',
    targetAudience: 'Cart abandoners, potential customers',
  },
  {
    id: 'ecom-seasonal-campaign',
    name: 'Seasonal Sale Campaign',
    category: 'E-commerce',
    description: 'Create seasonal marketing campaigns',
    prompt: 'Design seasonal sale campaign content including seasonal theme integration, product highlights, special offers, limited time elements, gift ideas, and holiday spirit. Make it timely and festive.',
    icon: '🎁',
    tags: ['seasonal', 'sale', 'holiday', 'gifts'],
    difficulty: 'beginner',
    estimatedTime: '3-4 minutes',
    targetAudience: 'Holiday shoppers, gift buyers',
  },

  // B2B TEMPLATES
  {
    id: 'b2b-proposal',
    name: 'Business Proposal',
    category: 'B2B Marketing',
    description: 'Create professional business proposals',
    prompt: 'Write business proposal content including executive summary, company overview, proposed solution, implementation timeline, pricing structure, and next steps. Make it professional and compelling.',
    icon: '💼',
    tags: ['proposal', 'B2B', 'professional', 'solution'],
    difficulty: 'advanced',
    estimatedTime: '8-10 minutes',
    targetAudience: 'Business decision makers',
  },
  {
    id: 'b2b-lead-magnet',
    name: 'Lead Magnet Content',
    category: 'B2B Marketing',
    description: 'Generate valuable lead magnet content',
    prompt: 'Create lead magnet content including industry insights, actionable strategies, expert tips, research findings, and practical frameworks. Make it valuable enough to exchange for contact information.',
    icon: '🧲',
    tags: ['lead magnet', 'value', 'insights', 'lead generation'],
    difficulty: 'advanced',
    estimatedTime: '6-8 minutes',
    targetAudience: 'Business prospects, industry professionals',
  },
  {
    id: 'b2b-webinar-promo',
    name: 'Webinar Promotion',
    category: 'B2B Marketing',
    description: 'Promote webinars and events',
    prompt: 'Create webinar promotion content including compelling topic presentation, speaker credentials, key takeaways preview, registration benefits, and urgency elements. Make it registration-focused.',
    icon: '🎙️',
    tags: ['webinar', 'event', 'registration', 'education'],
    difficulty: 'intermediate',
    estimatedTime: '4-5 minutes',
    targetAudience: 'Industry professionals, learners',
  },
];

export const getTemplatesByCategory = (category: string): CampaignTemplate[] => {
  return campaignTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string): CampaignTemplate | undefined => {
  return campaignTemplates.find(template => template.id === id);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(campaignTemplates.map(template => template.category)));
};

export const searchTemplates = (query: string): CampaignTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return campaignTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};