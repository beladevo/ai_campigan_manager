import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import CampaignDashboard from '../CampaignDashboard'
import { createMockCampaigns, mockSuccessfulFetch } from '@/__tests__/utils/test-utils'
import * as api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

// Mock Notification API
const mockNotification = jest.fn()
global.Notification = mockNotification as any

describe('CampaignDashboard', () => {
  const mockSetCampaigns = jest.fn()
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    mockSetCampaigns.mockClear()
    mockNotification.mockClear()
    
    // Mock notification permission
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      value: 'granted'
    })
  })

  it('renders empty state when no campaigns exist', () => {
    render(<CampaignDashboard campaigns={[]} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('No campaigns yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first campaign to get started with AI-powered content generation.')).toBeInTheDocument()
  })

  it('renders campaign list with multiple campaigns', () => {
    const campaigns = createMockCampaigns(3)
    
    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('Your Campaigns')).toBeInTheDocument()
    
    campaigns.forEach((campaign, index) => {
      expect(screen.getByText(`Campaign #${campaign.id.slice(-8)}`)).toBeInTheDocument()
      expect(screen.getByText(`Test campaign prompt ${index}`)).toBeInTheDocument()
    })
  })

  it('displays correct status indicators for different campaign states', () => {
    const campaigns = [
      createMockCampaigns(1)[0], // COMPLETED
      { ...createMockCampaigns(1)[0], id: 'test-2', status: 'PROCESSING' as const },
      { ...createMockCampaigns(1)[0], id: 'test-3', status: 'PENDING' as const },
      { ...createMockCampaigns(1)[0], id: 'test-4', status: 'FAILED' as const }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('COMPLETED')).toBeInTheDocument()
    expect(screen.getByText('PROCESSING')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('FAILED')).toBeInTheDocument()
  })

  it('shows campaign progress for processing campaigns', () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'PROCESSING' as const,
        currentStep: 'generating_text' as const,
        progressPercentage: 40
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Generating Text')).toBeInTheDocument()
  })

  it('shows completion notification for completed campaigns', () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'COMPLETED' as const,
        generatedText: 'Generated content'
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('🎉 Campaign completed! Your content is ready.')).toBeInTheDocument()
  })

  it('displays preview for completed campaigns with generated text', () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'COMPLETED' as const,
        generatedText: '# Test Content\n\nThis is generated markdown content.'
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('Preview:')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('opens campaign details modal when View Details is clicked', async () => {
    const campaigns = createMockCampaigns(1)
    
    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    const viewDetailsButton = screen.getByText('View Details')
    await user.click(viewDetailsButton)

    expect(screen.getByText(`Campaign Details - ${campaigns[0].id.slice(-8)}`)).toBeInTheDocument()
    expect(screen.getByText('Original Prompt')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', async () => {
    const campaigns = createMockCampaigns(1)
    
    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    // Open modal
    await user.click(screen.getByText('View Details'))
    expect(screen.getByText('Campaign Details')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Campaign Details')).not.toBeInTheDocument()
    })
  })

  it('shows copy button and handles copy action', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        generatedText: 'Content to copy'
      }
    ]

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    })

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    // Open modal to see copy button
    await user.click(screen.getByText('View Details'))
    
    const copyButton = screen.getByText('Copy Content')
    await user.click(copyButton)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Content to copy')
  })

  it('shows download button for campaigns with images', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        imagePath: 'test-image.png'
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    await user.click(screen.getByText('View Details'))
    
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('handles image download correctly', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        imagePath: 'test-image.png'
      }
    ]

    // Mock document.createElement
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    }
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    await user.click(screen.getByText('View Details'))
    await user.click(screen.getByText('Download'))

    expect(mockLink.href).toBe('http://localhost:3000/output/test-image.png')
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('polls for campaign updates on active campaigns', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'PROCESSING' as const
      }
    ]

    mockedApi.getCampaign.mockResolvedValue({
      ...campaigns[0],
      status: 'COMPLETED'
    })

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    // Wait for polling to trigger
    await waitFor(() => {
      expect(mockedApi.getCampaign).toHaveBeenCalledWith(campaigns[0].id)
    }, { timeout: 3000 })
  })

  it('shows refresh button for pending/processing campaigns', () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'PROCESSING' as const
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    const refreshButton = screen.getByTitle('Refresh status')
    expect(refreshButton).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'PROCESSING' as const
      }
    ]

    mockedApi.getCampaign.mockResolvedValue({
      ...campaigns[0],
      status: 'COMPLETED'
    })

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    const refreshButton = screen.getByTitle('Refresh status')
    await user.click(refreshButton)

    await waitFor(() => {
      expect(mockedApi.getCampaign).toHaveBeenCalledWith(campaigns[0].id)
    })
  })

  it('prevents multiple refresh requests for same campaign', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'PROCESSING' as const
      }
    ]

    mockedApi.getCampaign.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(campaigns[0]), 1000))
    )

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    const refreshButton = screen.getByTitle('Refresh status')
    
    // Click multiple times quickly
    await user.click(refreshButton)
    await user.click(refreshButton)
    await user.click(refreshButton)

    // Should only call API once
    expect(mockedApi.getCampaign).toHaveBeenCalledTimes(1)
  })

  it('shows error message for failed campaigns', () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'FAILED' as const,
        errorMessage: 'Generation failed due to API error'
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    expect(screen.getByText('Error Details')).toBeInTheDocument()
    expect(screen.getByText('Generation failed due to API error')).toBeInTheDocument()
  })

  it('requests notification permission on mount', () => {
    const mockRequestPermission = jest.fn().mockResolvedValue('granted')
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      value: 'default'
    })
    Notification.requestPermission = mockRequestPermission

    render(<CampaignDashboard campaigns={[]} setCampaigns={mockSetCampaigns} />)

    expect(mockRequestPermission).toHaveBeenCalled()
  })

  it('shows browser notification for completed campaigns', async () => {
    const campaigns = [
      {
        ...createMockCampaigns(1)[0],
        status: 'COMPLETED' as const
      }
    ]

    render(<CampaignDashboard campaigns={campaigns} setCampaigns={mockSetCampaigns} />)

    await waitFor(() => {
      expect(mockNotification).toHaveBeenCalledWith(
        `Campaign #${campaigns[0].id.slice(-8)} Complete!`,
        {
          body: 'Your AI-generated content is ready.',
          icon: '/favicon.ico'
        }
      )
    })
  })
})