import axios from 'axios';
import { Campaign, CreateCampaignRequest } from '@/types/campaign';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const createCampaign = async (request: CreateCampaignRequest): Promise<Campaign> => {
  const response = await api.post<Campaign>('/campaigns', request);
  return response.data;
};

export const getCampaign = async (id: string): Promise<Campaign> => {
  const response = await api.get<Campaign>(`/campaigns/${id}`);
  return response.data;
};

export const getAllCampaigns = async (userId: string): Promise<Campaign[]> => {
  const response = await api.get<Campaign[]>(`/campaigns/user/${userId}`);
  return response.data;
};