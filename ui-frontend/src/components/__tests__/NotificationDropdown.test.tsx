import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NotificationDropdown from '../NotificationDropdown';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 minutes ago'),
}));

describe('NotificationDropdown', () => {
  const mockOnOpenSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
    (global.fetch as jest.Mock).mockClear();
  });

  const renderComponent = () => {
    return render(<NotificationDropdown onOpenSettings={mockOnOpenSettings} />);
  };

  const mockNotifications = [
    {
      id: '1',
      type: 'campaign_completed',
      title: 'Campaign Complete',
      message: 'Your campaign has been completed successfully',
      status: 'UNREAD',
      createdAt: '2024-01-01T10:00:00Z',
      data: { campaignId: 'campaign-123' },
    },
    {
      id: '2',
      type: 'campaign_failed',
      title: 'Campaign Failed',
      message: 'Your campaign generation failed',
      status: 'READ',
      createdAt: '2024-01-01T09:00:00Z',
      data: { campaignId: 'campaign-456' },
    },
  ];

  it('should render notification bell with unread count', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 3 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should open dropdown when bell is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Campaign Complete')).toBeInTheDocument();
      expect(screen.getByText('Campaign Failed')).toBeInTheDocument();
    });
  });

  it('should display empty state when no notifications', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
      expect(screen.getByText('You\'ll see campaign updates and important alerts here')).toBeInTheDocument();
    });
  });

  it('should mark notification as read when clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [mockNotifications[0]] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Campaign Complete')).toBeInTheDocument();
    });

    // Click on the notification
    const notificationElement = screen.getByText('Campaign Complete').closest('div');
    await userEvent.click(notificationElement!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/notifications/1/read',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
  });

  it('should mark all notifications as read', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('You have 2 unread notifications')).toBeInTheDocument();
    });

    // Click mark all as read button
    const markAllButton = screen.getByTitle('Mark all as read');
    await userEvent.click(markAllButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/notifications/mark-all-read',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
  });

  it('should open notification settings when settings button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const settingsButton = screen.getByTitle('Notification settings');
    await userEvent.click(settingsButton);

    expect(mockOnOpenSettings).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to load notifications')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    // Click outside the dropdown
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should refresh notifications when refresh button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await userEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Campaign Complete')).toBeInTheDocument();
    });
  });

  it('should show correct notification icons based on type', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications }),
      });

    renderComponent();

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      // Check for emoji icons
      expect(screen.getByText('🎉')).toBeInTheDocument(); // campaign_completed
      expect(screen.getByText('❌')).toBeInTheDocument(); // campaign_failed
    });
  });
});