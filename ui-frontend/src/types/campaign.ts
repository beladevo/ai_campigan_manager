export interface Campaign {
  id: string;
  userId: string;
  prompt: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  generatedText?: string;
  imagePath?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  userId: string;
  prompt: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'e-commerce' | 'social-media' | 'blog' | 'email' | 'ad-copy';
  promptTemplate: string;
  icon: string;
}