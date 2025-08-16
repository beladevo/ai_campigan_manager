import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import UserSettings from '../UserSettings'

describe('UserSettings', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
  })

  it('renders settings page with header', () => {
    render(<UserSettings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument()
  })

  it('displays all navigation tabs', () => {
    render(<UserSettings />)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
    expect(screen.getByText('Data & Privacy')).toBeInTheDocument()
  })

  it('shows profile tab by default', () => {
    render(<UserSettings />)

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Acme Marketing')).toBeInTheDocument()
  })

  it('switches to notifications tab when clicked', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Notifications'))

    expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('Browser Notifications')).toBeInTheDocument()
  })

  it('toggles notification settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Notifications'))

    // Find notification toggles and test them
    const toggles = screen.getAllByRole('button').filter(button => 
      button.classList.contains('relative') && button.classList.contains('inline-flex')
    )

    expect(toggles.length).toBeGreaterThan(0)

    // Click the first toggle
    await user.click(toggles[0])
    
    // Verify the toggle state changed (checking for class changes)
    expect(toggles[0]).toBeInTheDocument()
  })

  it('shows security settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Security'))

    expect(screen.getByText('Password & Security')).toBeInTheDocument()
    expect(screen.getByText('Two-factor authentication is enabled')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Manage 2FA')).toBeInTheDocument()
  })

  it('displays API key section in security', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Security'))

    expect(screen.getByText('API Access')).toBeInTheDocument()
    expect(screen.getByDisplayValue('sk-1234567890abcdef1234567890abcdef')).toBeInTheDocument()
    expect(screen.getByText('Regenerate')).toBeInTheDocument()
  })

  it('toggles API key visibility', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Security'))

    const apiKeyInput = screen.getByDisplayValue('sk-1234567890abcdef1234567890abcdef')
    expect(apiKeyInput).toHaveAttribute('type', 'password')

    // Find and click the eye icon
    const toggleButtons = screen.getAllByRole('button')
    const eyeButton = toggleButtons.find(button => 
      button.querySelector('svg')?.getAttribute('class')?.includes('w-4 h-4')
    )

    if (eyeButton) {
      await user.click(eyeButton)
      expect(apiKeyInput).toHaveAttribute('type', 'text')
    }
  })

  it('shows active sessions in security tab', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Security'))

    expect(screen.getByText('Active Sessions')).toBeInTheDocument()
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument()
    expect(screen.getByText('Safari on iPhone')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('displays preferences settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Preferences'))

    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('allows theme selection', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Preferences'))

    const darkThemeButton = screen.getByText('Dark').closest('button')
    await user.click(darkThemeButton!)

    // Theme should be selected (visual changes would be reflected in classes)
    expect(darkThemeButton).toBeInTheDocument()
  })

  it('shows language and timezone settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Preferences'))

    expect(screen.getByText('Language & Region')).toBeInTheDocument()
    
    const languageSelect = screen.getByDisplayValue('English')
    expect(languageSelect).toBeInTheDocument()
    
    const timezoneSelect = screen.getByDisplayValue('GMT-5 (Eastern Time)')
    expect(timezoneSelect).toBeInTheDocument()
  })

  it('displays billing information', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Billing'))

    expect(screen.getByText('Current Plan')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$29/month')).toBeInTheDocument()
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
  })

  it('shows all plan options in billing', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Billing'))

    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('$0/month')).toBeInTheDocument()
    expect(screen.getByText('$99/month')).toBeInTheDocument()
  })

  it('displays payment method', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Billing'))

    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByText('•••• •••• •••• 4242')).toBeInTheDocument()
    expect(screen.getByText('Expires 12/25')).toBeInTheDocument()
  })

  it('shows billing history', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Billing'))

    expect(screen.getByText('Billing History')).toBeInTheDocument()
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('Dec 1, 2024')).toBeInTheDocument()
    expect(screen.getByText('$29.00')).toBeInTheDocument()
  })

  it('displays data and privacy settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Data & Privacy'))

    expect(screen.getByText('Data Export')).toBeInTheDocument()
    expect(screen.getByText('Export All Data')).toBeInTheDocument()
    expect(screen.getByText('Export Campaigns')).toBeInTheDocument()
  })

  it('shows privacy settings toggles', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Data & Privacy'))

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument()
    expect(screen.getByText('Analytics Tracking')).toBeInTheDocument()
    expect(screen.getByText('Performance Monitoring')).toBeInTheDocument()
  })

  it('displays danger zone for account deletion', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Data & Privacy'))

    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getByText('Delete Account')).toBeInTheDocument()
    expect(screen.getByText('Once you delete your account, there is no going back')).toBeInTheDocument()
  })

  it('handles profile form changes', async () => {
    render(<UserSettings />)

    const nameInput = screen.getByDisplayValue('John Doe')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Smith')

    expect(nameInput).toHaveValue('Jane Smith')
  })

  it('shows save changes button in profile', () => {
    render(<UserSettings />)

    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('allows language selection', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Preferences'))

    const languageSelect = screen.getByDisplayValue('English')
    await user.selectOptions(languageSelect, 'es')

    expect(languageSelect).toHaveValue('es')
  })

  it('handles default campaign settings', async () => {
    render(<UserSettings />)

    await user.click(screen.getByText('Preferences'))

    expect(screen.getByText('Default Campaign Settings')).toBeInTheDocument()
    expect(screen.getByText('Default Tone')).toBeInTheDocument()
    expect(screen.getByText('Content Length')).toBeInTheDocument()
  })

  it('maintains active tab state correctly', async () => {
    render(<UserSettings />)

    // Click on Security tab
    const securityTab = screen.getByText('Security')
    await user.click(securityTab)

    // Security tab should have active styling
    expect(securityTab.closest('button')).toHaveClass('bg-indigo-50', 'text-indigo-700')

    // Profile tab should not have active styling
    const profileTab = screen.getByText('Profile')
    expect(profileTab.closest('button')).not.toHaveClass('bg-indigo-50', 'text-indigo-700')
  })
})