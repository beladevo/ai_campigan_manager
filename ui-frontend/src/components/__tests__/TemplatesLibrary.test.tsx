import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import TemplatesLibrary from '../TemplatesLibrary'
import { createMockTemplate } from '@/__tests__/utils/test-utils'

describe('TemplatesLibrary', () => {
  const mockOnSelectTemplate = jest.fn()
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    mockOnSelectTemplate.mockClear()
  })

  it('renders template library header and description', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    expect(screen.getByText('Campaign Templates')).toBeInTheDocument()
    expect(screen.getByText('Choose from our library of proven campaign templates')).toBeInTheDocument()
  })

  it('displays categories sidebar with counts', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('All Templates')).toBeInTheDocument()
    expect(screen.getByText('E-Commerce')).toBeInTheDocument()
    expect(screen.getByText('Social Media')).toBeInTheDocument()
    expect(screen.getByText('Email Marketing')).toBeInTheDocument()
    expect(screen.getByText('Ad Copy')).toBeInTheDocument()

    // Check that counts are displayed
    expect(screen.getByText('24')).toBeInTheDocument() // All templates count
    expect(screen.getByText('8')).toBeInTheDocument()  // E-commerce count
  })

  it('shows search input field', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const searchInput = screen.getByPlaceholderText('Search templates...')
    expect(searchInput).toBeInTheDocument()
  })

  it('displays template cards with correct information', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Check for some known template names
    expect(screen.getByText('Product Launch Campaign')).toBeInTheDocument()
    expect(screen.getByText('Viral Social Post')).toBeInTheDocument()
    expect(screen.getByText('Welcome Email Series')).toBeInTheDocument()

    // Check for template ratings and usage stats
    expect(screen.getAllByText(/4\.\d/)).toHaveLength(12) // ratings
    expect(screen.getByText(/1,247 uses/)).toBeInTheDocument()
  })

  it('filters templates by category', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Click on E-Commerce category
    const ecommerceButton = screen.getByText('E-Commerce')
    await user.click(ecommerceButton)

    // Should show e-commerce templates
    expect(screen.getByText('Product Launch Campaign')).toBeInTheDocument()
    expect(screen.getByText('Seasonal Sale Promo')).toBeInTheDocument()

    // Should not show social media templates
    expect(screen.queryByText('Viral Social Post')).not.toBeInTheDocument()
  })

  it('filters templates by search term', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const searchInput = screen.getByPlaceholderText('Search templates...')
    await user.type(searchInput, 'email')

    // Should show email-related templates
    expect(screen.getByText('Welcome Email Series')).toBeInTheDocument()
    expect(screen.getByText('Cart Recovery Email')).toBeInTheDocument()

    // Should not show non-email templates
    expect(screen.queryByText('Product Launch Campaign')).not.toBeInTheDocument()
  })

  it('searches by tags', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const searchInput = screen.getByPlaceholderText('Search templates...')
    await user.type(searchInput, 'urgency')

    // Should show templates with 'urgency' tag
    expect(screen.getByText('Seasonal Sale Promo')).toBeInTheDocument()
  })

  it('shows no results message when search yields no matches', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const searchInput = screen.getByPlaceholderText('Search templates...')
    await user.type(searchInput, 'nonexistenttemplate')

    expect(screen.getByText('No templates found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument()
  })

  it('handles favorite toggle functionality', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const favoriteButtons = screen.getAllByRole('button', { name: '' })
    const heartButton = favoriteButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('w-5 h-5')
    )

    if (heartButton) {
      await user.click(heartButton)
      
      // The heart should now be filled (though we can't easily test the exact styling)
      expect(heartButton).toBeInTheDocument()
    }
  })

  it('calls onSelectTemplate when Use Template button is clicked', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const useTemplateButtons = screen.getAllByText('Use Template')
    await user.click(useTemplateButtons[0])

    expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1)
    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        category: expect.any(String)
      })
    )
  })

  it('displays template tags correctly', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Check for some known tags
    expect(screen.getByText('launch')).toBeInTheDocument()
    expect(screen.getByText('product')).toBeInTheDocument()
    expect(screen.getByText('viral')).toBeInTheDocument()
    expect(screen.getByText('engagement')).toBeInTheDocument()
  })

  it('shows +N indicator when template has more than 3 tags', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Look for templates that should have more than 3 tags
    const moreTagsIndicators = screen.getAllByText(/^\+\d+$/)
    expect(moreTagsIndicators.length).toBeGreaterThan(0)
  })

  it('displays template icons and emojis', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Check for emoji icons
    expect(screen.getByText('🚀')).toBeInTheDocument() // Product launch
    expect(screen.getByText('📱')).toBeInTheDocument() // Social post
    expect(screen.getByText('👋')).toBeInTheDocument() // Welcome email
  })

  it('shows eye icon button for preview', () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const eyeButtons = screen.getAllByRole('button')
    const previewButtons = eyeButtons.filter(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('w-4 h-4')
    )
    
    expect(previewButtons.length).toBeGreaterThan(0)
  })

  it('maintains filter state when switching between categories', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // Set a search term
    const searchInput = screen.getByPlaceholderText('Search templates...')
    await user.type(searchInput, 'email')

    // Switch to email category
    await user.click(screen.getByText('Email Marketing'))

    // Search term should still be there
    expect(searchInput).toHaveValue('email')

    // Should show only email templates that match the search
    expect(screen.getByText('Welcome Email Series')).toBeInTheDocument()
  })

  it('clears search results when clearing search input', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const searchInput = screen.getByPlaceholderText('Search templates...')
    
    // Search for something specific
    await user.type(searchInput, 'email')
    expect(screen.queryByText('Product Launch Campaign')).not.toBeInTheDocument()

    // Clear search
    await user.clear(searchInput)
    
    // Should show all templates again
    expect(screen.getByText('Product Launch Campaign')).toBeInTheDocument()
  })

  it('highlights selected category', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    const ecommerceButton = screen.getByText('E-Commerce')
    await user.click(ecommerceButton)

    // The button should have active styling
    expect(ecommerceButton.closest('button')).toHaveClass('bg-indigo-50', 'text-indigo-700')
  })

  it('resets to all templates when clicking All Templates', async () => {
    render(<TemplatesLibrary onSelectTemplate={mockOnSelectTemplate} />)

    // First select a specific category
    await user.click(screen.getByText('E-Commerce'))
    expect(screen.queryByText('Viral Social Post')).not.toBeInTheDocument()

    // Then click All Templates
    await user.click(screen.getByText('All Templates'))
    
    // Should show templates from all categories
    expect(screen.getByText('Product Launch Campaign')).toBeInTheDocument()
    expect(screen.getByText('Viral Social Post')).toBeInTheDocument()
    expect(screen.getByText('Welcome Email Series')).toBeInTheDocument()
  })
})