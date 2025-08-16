export type CampaignStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CampaignStep = 'queued' | 'generating_text' | 'generating_image' | 'finalizing' | 'done';

export interface Campaign {
  id: string;
  userId: string;
  prompt: string;
  status: CampaignStatus;
  generatedText?: string;
  imagePath?: string;
  errorMessage?: string;
  currentStep?: CampaignStep;
  progressPercentage?: number;
  startedAt?: string;
  completedAt?: string;
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