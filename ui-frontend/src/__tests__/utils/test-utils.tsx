import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Campaign, CampaignTemplate } from '@/types/campaign'

// Mock data generators
export const createMockCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
  id: 'test-campaign-id',
  userId: 'test-user-id',
  prompt: 'Test campaign prompt',
  status: 'COMPLETED',
  generatedText: '# Test Generated Content\n\nThis is a test campaign with **bold** text and [links](https://example.com).',
  imagePath: 'test-image.png',
  errorMessage: null,
  currentStep: 'done',
  progressPercentage: 100,
  startedAt: '2024-01-01T12:00:00Z',
  completedAt: '2024-01-01T12:01:00Z',
  createdAt: '2024-01-01T12:00:00Z',
  updatedAt: '2024-01-01T12:01:00Z',
  ...overrides,
})

export const createMockTemplate = (overrides: Partial<CampaignTemplate> = {}): CampaignTemplate => ({
  id: 'test-template-id',
  name: 'Test Template',
  description: 'A test template for unit testing',
  category: 'e-commerce',
  promptTemplate: 'Create content for {product} targeting {audience}',
  icon: '🧪',
  rating: 4.5,
  uses: 100,
  tags: ['test', 'template'],
  ...overrides,
})

export const createMockCampaigns = (count: number = 5): Campaign[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockCampaign({
      id: `test-campaign-${index}`,
      prompt: `Test campaign prompt ${index}`,
      status: index % 4 === 0 ? 'COMPLETED' : 
              index % 4 === 1 ? 'PROCESSING' : 
              index % 4 === 2 ? 'PENDING' : 'FAILED',
      createdAt: new Date(2024, 0, index + 1).toISOString(),
    })
  )
}

// Custom render function that includes providers if needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for common test scenarios
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.IntersectionObserver = mockIntersectionObserver
}

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  window.ResizeObserver = mockResizeObserver
}

// Mock fetch responses
export const mockSuccessfulFetch = (data: any) => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    status: 200,
  })
}

export const mockFailedFetch = (status: number = 500, statusText: string = 'Internal Server Error') => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: async () => ({ error: statusText }),
  })
}

// Mock console methods
export const mockConsoleMethod = (method: 'log' | 'error' | 'warn' | 'info') => {
  const originalMethod = console[method]
  const mockedMethod = jest.fn()
  console[method] = mockedMethod
  
  return {
    mock: mockedMethod,
    restore: () => {
      console[method] = originalMethod
    }
  }
}