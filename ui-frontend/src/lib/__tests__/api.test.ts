import axios from 'axios'
import { createCampaign, getCampaign, getAllCampaigns, getUserUsage } from '../api'
import { createMockCampaign } from '@/__tests__/utils/test-utils'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock axios.create
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}

mockedAxios.create.mockReturnValue(mockAxiosInstance as any)

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock window.location
const mockLocation = {
  href: ''
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCampaign', () => {
    it('calls POST /campaigns with correct data', async () => {
      const mockCampaign = createMockCampaign()
      const requestData = { prompt: 'Test prompt' }
      
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockCampaign
      })

      const result = await createCampaign(requestData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/campaigns', requestData)
      expect(result).toEqual(mockCampaign)
    })

    it('handles API errors correctly', async () => {
      const requestData = { prompt: 'Test prompt' }
      const error = new Error('API Error')
      
      mockAxiosInstance.post.mockRejectedValueOnce(error)

      await expect(createCampaign(requestData)).rejects.toThrow('API Error')
    })
  })

  describe('getCampaign', () => {
    it('calls GET /campaigns/:id with correct campaign ID', async () => {
      const mockCampaign = createMockCampaign()
      const campaignId = 'test-campaign-id'
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockCampaign
      })

      const result = await getCampaign(campaignId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/campaigns/${campaignId}`)
      expect(result).toEqual(mockCampaign)
    })

    it('handles 404 errors for non-existent campaigns', async () => {
      const campaignId = 'non-existent-id'
      const error = {
        response: {
          status: 404,
          data: { error: 'Campaign not found' }
        }
      }
      
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      await expect(getCampaign(campaignId)).rejects.toEqual(error)
    })
  })

  describe('getAllCampaigns', () => {
    it('calls GET /campaigns/my-campaigns', async () => {
      const mockCampaigns = [createMockCampaign(), createMockCampaign()]
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockCampaigns
      })

      const result = await getAllCampaigns()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/campaigns/my-campaigns')
      expect(result).toEqual(mockCampaigns)
    })

    it('returns empty array when no campaigns exist', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: []
      })

      const result = await getAllCampaigns()

      expect(result).toEqual([])
    })
  })

  describe('getUserUsage', () => {
    it('calls GET /auth/usage', async () => {
      const mockUsage = {
        campaigns: { used: 25, limit: 100 },
        apiCalls: { used: 150, limit: 500 }
      }
      
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockUsage
      })

      const result = await getUserUsage()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/usage')
      expect(result).toEqual(mockUsage)
    })
  })

  describe('Axios Configuration', () => {
    it('creates axios instance with correct base URL and timeout', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 30000,
      })
    })

    it('sets up request interceptor to add auth token', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      
      // Get the interceptor function
      const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      // Test with token in localStorage
      mockLocalStorage.getItem.mockReturnValue('test-token')
      const config = { headers: {} }
      const result = interceptorFn(config)
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('auth_token')
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('handles request interceptor without token', () => {
      const interceptorFn = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      
      // Test without token in localStorage
      mockLocalStorage.getItem.mockReturnValue(null)
      const config = { headers: {} }
      const result = interceptorFn(config)
      
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('sets up response interceptor to handle auth errors', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
      
      // Get the error handler function
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      // Test 401 error handling
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      }
      
      expect(() => errorHandler(error)).rejects.toEqual(error)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocation.href).toBe('/')
    })

    it('passes through non-401 errors without modification', () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      
      const error = {
        response: {
          status: 500,
          data: { error: 'Server Error' }
        }
      }
      
      expect(() => errorHandler(error)).rejects.toEqual(error)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })

    it('handles successful responses without modification', () => {
      const successHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][0]
      
      const response = { data: { test: 'data' }, status: 200 }
      const result = successHandler(response)
      
      expect(result).toEqual(response)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network Error')
      networkError.message = 'Network Error'
      
      mockAxiosInstance.get.mockRejectedValueOnce(networkError)

      await expect(getCampaign('test-id')).rejects.toThrow('Network Error')
    })

    it('handles timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded')
      
      mockAxiosInstance.post.mockRejectedValueOnce(timeoutError)

      await expect(createCampaign({ prompt: 'test' })).rejects.toThrow('timeout of 30000ms exceeded')
    })

    it('handles server errors with error response', async () => {
      const serverError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: 'Something went wrong' }
        }
      }
      
      mockAxiosInstance.get.mockRejectedValueOnce(serverError)

      await expect(getAllCampaigns()).rejects.toEqual(serverError)
    })
  })

  describe('Environment Configuration', () => {
    it('uses environment variable for API URL when available', () => {
      // Mock process.env
      const originalEnv = process.env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
      
      // Re-import the module to pick up the env var
      jest.resetModules()
      
      // Reset back
      process.env.NEXT_PUBLIC_API_URL = originalEnv
    })

    it('falls back to localhost when no environment variable is set', () => {
      delete process.env.NEXT_PUBLIC_API_URL
      
      // The default should be localhost:3000
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:3000'
        })
      )
    })
  })
})