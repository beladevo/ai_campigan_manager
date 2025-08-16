import { render, screen } from '@/__tests__/utils/test-utils'
import CampaignProgress from '../CampaignProgress'
import { createMockCampaign } from '@/__tests__/utils/test-utils'

describe('CampaignProgress', () => {
  it('renders completed campaign correctly', () => {
    const campaign = createMockCampaign({
      status: 'COMPLETED',
      currentStep: 'done',
      progressPercentage: 100,
      completedAt: '2024-01-01T12:05:00Z'
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText('Campaign Complete! ✨')).toBeInTheDocument()
    expect(screen.getByText(/Completed/)).toBeInTheDocument()
  })

  it('renders failed campaign with error message', () => {
    const campaign = createMockCampaign({
      status: 'FAILED',
      errorMessage: 'Generation failed due to API error'
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText('Campaign Failed')).toBeInTheDocument()
    expect(screen.getByText('Generation failed due to API error')).toBeInTheDocument()
  })

  it('renders processing campaign with progress bar', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: 'generating_text',
      progressPercentage: 40,
      startedAt: '2024-01-01T12:00:00Z'
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('Generating Text')).toBeInTheDocument()
    expect(screen.getByText('AI is creating your content')).toBeInTheDocument()
  })

  it('renders timeline with correct step states', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: 'generating_image',
      progressPercentage: 80
    })

    render(<CampaignProgress campaign={campaign} />)

    // Should show completed steps
    expect(screen.getByText('✓ Done')).toBeInTheDocument()
    
    // Should show current step
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Generating Image')).toBeInTheDocument()
  })

  it('displays duration for processing campaigns', () => {
    const startTime = new Date(Date.now() - 30000).toISOString() // 30 seconds ago
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: 'generating_text',
      startedAt: startTime
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText(/Duration:/)).toBeInTheDocument()
    expect(screen.getByText(/\d+s/)).toBeInTheDocument()
  })

  it('shows started time when available', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      startedAt: '2024-01-01T12:00:00Z'
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText(/Started:/)).toBeInTheDocument()
  })

  it('handles pending status correctly', () => {
    const campaign = createMockCampaign({
      status: 'PENDING',
      currentStep: 'queued',
      progressPercentage: 10
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText('Queued')).toBeInTheDocument()
    expect(screen.getByText('Campaign queued for processing')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('shows correct progress percentage for each step', () => {
    const steps = [
      { step: 'queued' as const, expectedMin: 10 },
      { step: 'generating_text' as const, expectedMin: 40 },
      { step: 'generating_image' as const, expectedMin: 80 },
      { step: 'finalizing' as const, expectedMin: 95 },
      { step: 'done' as const, expectedMin: 100 }
    ]

    steps.forEach(({ step, expectedMin }) => {
      const campaign = createMockCampaign({
        status: step === 'done' ? 'COMPLETED' : 'PROCESSING',
        currentStep: step,
        progressPercentage: 0 // Should be overridden by step config
      })

      const { rerender } = render(<CampaignProgress campaign={campaign} />)
      
      const progressText = screen.getByText(new RegExp(`${expectedMin}%`))
      expect(progressText).toBeInTheDocument()
      
      rerender(<div />) // Clear for next iteration
    })
  })

  it('renders all timeline steps', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: 'generating_text'
    })

    render(<CampaignProgress campaign={campaign} />)

    const expectedSteps = [
      'Queued',
      'Generating Text', 
      'Generating Image',
      'Finalizing',
      'Complete'
    ]

    expectedSteps.forEach(stepName => {
      expect(screen.getByText(stepName)).toBeInTheDocument()
    })
  })

  it('handles campaign without currentStep gracefully', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: undefined,
      progressPercentage: 50
    })

    render(<CampaignProgress campaign={campaign} />)

    // Should default to queued step
    expect(screen.getByText('Queued')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('shows loading spinner for processing status', () => {
    const campaign = createMockCampaign({
      status: 'PROCESSING',
      currentStep: 'generating_text'
    })

    render(<CampaignProgress campaign={campaign} />)

    // The animate-spin class should be present on the loader
    const loader = document.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('displays completion time when campaign is done', () => {
    const campaign = createMockCampaign({
      status: 'COMPLETED',
      completedAt: '2024-01-01T12:05:30Z'
    })

    render(<CampaignProgress campaign={campaign} />)

    expect(screen.getByText(/Completed:/)).toBeInTheDocument()
  })

  it('applies correct CSS classes for different states', () => {
    const campaign = createMockCampaign({
      status: 'COMPLETED'
    })

    render(<CampaignProgress campaign={campaign} />)

    const completedContainer = screen.getByText('Campaign Complete! ✨').closest('div')
    expect(completedContainer).toHaveClass('bg-green-50', 'border-green-200')
  })
})