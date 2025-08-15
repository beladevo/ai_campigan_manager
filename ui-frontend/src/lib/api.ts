import axios from 'axios';
import { Campaign, CreateCampaignRequest } from '@/types/campaign';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      localStorage.removeItem('auth_token');
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const createCampaign = async (request: Omit<CreateCampaignRequest, 'userId'>): Promise<Campaign> => {
  const response = await api.post<Campaign>('/campaigns', request);
  return response.data;
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  const response = await api.get<Campaign>(`/campaigns/${id}`);
  return response.data;
};

export const getAllCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<Campaign[]>(`/campaigns/my-campaigns`);
  return response.data;
};

export const getUserUsage = async () => {
  const response = await api.get('/auth/usage');
  return response.data;
};