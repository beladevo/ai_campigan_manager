import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService, UpdatePreferencesDto } from './services/notification-preference.service';
import { NotificationType, NotificationChannel } from './entities/notification-preference.entity';
import { NotificationStatus } from './entities/notification.entity';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;
  let preferenceService: NotificationPreferenceService;

  const mockNotificationService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
    createNotification: jest.fn(),
  };

  const mockPreferenceService = {
    getUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    getNotificationTypeSettings: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 'user-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: NotificationPreferenceService,
          useValue: mockPreferenceService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
    preferenceService = module.get<NotificationPreferenceService>(NotificationPreferenceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with default limit', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test notification 1' },
        { id: '2', title: 'Test notification 2' },
      ];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await controller.getUserNotifications(mockRequest);

      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('user-123', 20);
      expect(result).toEqual({ notifications: mockNotifications });
    });

    it('should return user notifications with custom limit', async () => {
      const mockNotifications = [{ id: '1', title: 'Test notification' }];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await controller.getUserNotifications(mockRequest, '10');

      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('user-123', 10);
      expect(result).toEqual({ notifications: mockNotifications });
    });

    it('should handle invalid limit gracefully', async () => {
      const mockNotifications = [];

      mockNotificationService.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await controller.getUserNotifications(mockRequest, 'invalid');

      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith('user-123', 20);
      expect(result).toEqual({ notifications: mockNotifications });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      mockNotificationService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockRequest);

      expect(mockNotificationService.getUnreadCount).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationService.markNotificationAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(mockRequest, 'notification-123');

      expect(mockNotificationService.markNotificationAsRead).toHaveBeenCalledWith(
        'notification-123',
        'user-123'
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationService.markAllNotificationsAsRead.mockResolvedValue(undefined);

      const result = await controller.markAllAsRead(mockRequest);

      expect(mockNotificationService.markAllNotificationsAsRead).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUserPreferences', () => {
    it('should return user notification preferences', async () => {
      const mockPreferences = {
        preferences: [
          {
            type: NotificationType.CAMPAIGN_COMPLETED,
            channels: {
              [NotificationChannel.EMAIL]: true,
              [NotificationChannel.WEBSITE]: false,
              [NotificationChannel.BROWSER]: true,
            },
          },
        ],
      };

      mockPreferenceService.getUserPreferences.mockResolvedValue(mockPreferences);

      const result = await controller.getUserPreferences(mockRequest);

      expect(mockPreferenceService.getUserPreferences).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user notification preferences', async () => {
      const updateDto: UpdatePreferencesDto = {
        preferences: [
          {
            type: NotificationType.CAMPAIGN_COMPLETED,
            channels: {
              [NotificationChannel.EMAIL]: false,
              [NotificationChannel.WEBSITE]: true,
              [NotificationChannel.BROWSER]: false,
            },
          },
        ],
      };

      mockPreferenceService.updateUserPreferences.mockResolvedValue(undefined);

      const result = await controller.updateUserPreferences(mockRequest, updateDto);

      expect(mockPreferenceService.updateUserPreferences).toHaveBeenCalledWith('user-123', updateDto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getNotificationSettings', () => {
    it('should return notification type settings', async () => {
      const mockSettings = {
        types: [
          {
            type: NotificationType.CAMPAIGN_COMPLETED,
            title: 'Campaign Completed',
            description: 'When your campaign is ready',
            category: 'Campaign Updates',
          },
        ],
        channels: [
          {
            channel: NotificationChannel.EMAIL,
            title: 'Email',
            description: 'Receive notifications via email',
            icon: 'mail',
          },
        ],
      };

      mockPreferenceService.getNotificationTypeSettings.mockResolvedValue(mockSettings);

      const result = await controller.getNotificationSettings();

      expect(mockPreferenceService.getNotificationTypeSettings).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });

  describe('sendTestNotification', () => {
    it('should send test notification for valid type', async () => {
      mockNotificationService.createNotification.mockResolvedValue({ id: 'test-notification' });

      const result = await controller.sendTestNotification(mockRequest, 'campaign_completed');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 'user-123',
        type: 'campaign_completed',
        title: '🎉 Test Campaign Complete!',
        message: 'This is a test notification for campaign completion.',
        data: { campaignId: 'test-123', campaignTitle: 'Test Campaign' },
      });
      expect(result).toEqual({ success: true, message: 'Test notification sent' });
    });

    it('should return error for invalid notification type', async () => {
      const result = await controller.sendTestNotification(mockRequest, 'invalid_type');

      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'Invalid test notification type' });
    });

    it('should handle campaign_failed test notification', async () => {
      mockNotificationService.createNotification.mockResolvedValue({ id: 'test-notification' });

      const result = await controller.sendTestNotification(mockRequest, 'campaign_failed');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 'user-123',
        type: 'campaign_failed',
        title: '❌ Test Campaign Failed',
        message: 'This is a test notification for campaign failure.',
        data: { campaignId: 'test-123', error: 'Test error message' },
      });
      expect(result).toEqual({ success: true, message: 'Test notification sent' });
    });

    it('should handle usage_limit_warning test notification', async () => {
      mockNotificationService.createNotification.mockResolvedValue({ id: 'test-notification' });

      const result = await controller.sendTestNotification(mockRequest, 'usage_limit_warning');

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: 'user-123',
        type: 'usage_limit_warning',
        title: '⚠️ Test Usage Warning',
        message: 'This is a test notification for usage limit warning.',
        data: { percentage: 85, subscriptionTier: 'premium' },
      });
      expect(result).toEqual({ success: true, message: 'Test notification sent' });
    });
  });
});