import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from './notification.service';
import { Notification, NotificationStatus } from '../entities/notification.entity';
import { NotificationPreference, NotificationType, NotificationChannel } from '../entities/notification-preference.entity';
import { NotificationPreferenceService } from './notification-preference.service';
import { EmailService } from './email.service';
import { WebsiteNotificationService } from './website-notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: Repository<Notification>;
  let preferenceRepository: Repository<NotificationPreference>;
  let emailService: EmailService;
  let websiteNotificationService: WebsiteNotificationService;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockPreferenceRepository = {
    find: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    sendNotificationEmail: jest.fn(),
  };

  const mockWebsiteNotificationService = {
    sendWebsiteNotification: jest.fn(),
    sendBrowserNotification: jest.fn(),
  };

  const mockNotificationPreferenceService = {
    getUserPreferences: jest.fn(),
    initializeDefaultPreferences: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: mockPreferenceRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: WebsiteNotificationService,
          useValue: mockWebsiteNotificationService,
        },
        {
          provide: NotificationPreferenceService,
          useValue: mockNotificationPreferenceService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    preferenceRepository = module.get<Repository<NotificationPreference>>(getRepositoryToken(NotificationPreference));
    emailService = module.get<EmailService>(EmailService);
    websiteNotificationService = module.get<WebsiteNotificationService>(WebsiteNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    const mockNotificationData = {
      userId: 'user-123',
      type: NotificationType.CAMPAIGN_COMPLETED,
      title: 'Campaign Complete',
      message: 'Your campaign has been completed',
      data: { campaignId: 'campaign-123' },
    };

    const mockPreferences = [
      {
        userId: 'user-123',
        type: NotificationType.CAMPAIGN_COMPLETED,
        channel: NotificationChannel.EMAIL,
        enabled: true,
      },
      {
        userId: 'user-123',
        type: NotificationType.CAMPAIGN_COMPLETED,
        channel: NotificationChannel.WEBSITE,
        enabled: true,
      },
      {
        userId: 'user-123',
        type: NotificationType.CAMPAIGN_COMPLETED,
        channel: NotificationChannel.BROWSER,
        enabled: false,
      },
    ];

    const mockNotification = {
      id: 'notification-123',
      ...mockNotificationData,
      status: NotificationStatus.SENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create and send notification through enabled channels', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockPreferenceRepository.find.mockResolvedValue(mockPreferences);
      mockEmailService.sendNotificationEmail.mockResolvedValue(undefined);
      mockWebsiteNotificationService.sendWebsiteNotification.mockResolvedValue(undefined);

      const result = await service.createNotification(mockNotificationData);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        ...mockNotificationData,
        status: NotificationStatus.PENDING,
      });
      expect(mockNotificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(mockPreferenceRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123', type: NotificationType.CAMPAIGN_COMPLETED },
      });
      expect(mockEmailService.sendNotificationEmail).toHaveBeenCalledWith(mockNotification);
      expect(mockWebsiteNotificationService.sendWebsiteNotification).toHaveBeenCalledWith(mockNotification);
      expect(mockWebsiteNotificationService.sendBrowserNotification).not.toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    it('should handle email sending failure gracefully', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockPreferenceRepository.find.mockResolvedValue(mockPreferences);
      mockEmailService.sendNotificationEmail.mockRejectedValue(new Error('SMTP error'));
      mockWebsiteNotificationService.sendWebsiteNotification.mockResolvedValue(undefined);

      const result = await service.createNotification(mockNotificationData);

      expect(result).toEqual(mockNotification);
      expect(mockWebsiteNotificationService.sendWebsiteNotification).toHaveBeenCalled();
    });

    it('should not send through disabled channels', async () => {
      const disabledPreferences = {
        preferences: [
          {
            type: NotificationType.CAMPAIGN_COMPLETED,
            channels: {
              [NotificationChannel.EMAIL]: false,
              [NotificationChannel.WEBSITE]: false,
              [NotificationChannel.BROWSER]: false,
            },
          },
        ],
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockNotificationPreferenceService.getUserPreferences.mockResolvedValue(disabledPreferences);

      await service.createNotification(mockNotificationData);

      expect(mockEmailService.sendNotificationEmail).not.toHaveBeenCalled();
      expect(mockWebsiteNotificationService.sendWebsiteNotification).not.toHaveBeenCalled();
      expect(mockWebsiteNotificationService.sendBrowserNotification).not.toHaveBeenCalled();
    });

    it('should initialize default preferences if user has none', async () => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
      mockNotificationPreferenceService.getUserPreferences.mockResolvedValue({ preferences: [] });
      mockNotificationPreferenceService.initializeDefaultPreferences.mockResolvedValue(undefined);

      await service.createNotification(mockNotificationData);

      expect(mockNotificationPreferenceService.initializeDefaultPreferences).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with pagination', async () => {
      const mockNotifications = [
        { id: '1', userId: 'user-123', title: 'Test 1' },
        { id: '2', userId: 'user-123', title: 'Test 2' },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getUserNotifications('user-123', 10);

      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 10,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-123');

      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          status: NotificationStatus.SENT,
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read for the correct user', async () => {
      const mockNotification = {
        id: 'notification-123',
        userId: 'user-123',
        status: NotificationStatus.SENT,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      await service.markNotificationAsRead('notification-123', 'user-123');

      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-123', userId: 'user-123' },
      });
      expect(mockNotificationRepository.update).toHaveBeenCalledWith('notification-123', {
        status: NotificationStatus.READ,
      });
    });

    it('should throw error if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markNotificationAsRead('notification-123', 'user-123')
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all user notifications as read', async () => {
      mockNotificationRepository.update.mockResolvedValue(undefined);

      await service.markAllNotificationsAsRead('user-123');

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          status: NotificationStatus.SENT,
        },
        {
          status: NotificationStatus.READ,
        }
      );
    });
  });
});