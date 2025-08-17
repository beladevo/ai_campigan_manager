import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferenceService, UpdatePreferencesDto } from './notification-preference.service';
import { NotificationPreference, NotificationType, NotificationChannel } from '../entities/notification-preference.entity';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let repository: Repository<NotificationPreference>;

  const mockRepository = {
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferenceService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationPreferenceService>(NotificationPreferenceService);
    repository = module.get<Repository<NotificationPreference>>(getRepositoryToken(NotificationPreference));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPreferences', () => {
    it('should return user preferences with defaults for missing types', async () => {
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
          enabled: false,
        },
      ];

      mockRepository.find.mockResolvedValue(mockPreferences);

      const result = await service.getUserPreferences('user-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });

      expect(result.preferences).toHaveLength(Object.keys(NotificationType).length);
      
      // Check that CAMPAIGN_COMPLETED has the correct settings
      const campaignCompletedPref = result.preferences.find(
        p => p.type === NotificationType.CAMPAIGN_COMPLETED
      );
      expect(campaignCompletedPref).toBeDefined();
      expect(campaignCompletedPref!.channels[NotificationChannel.EMAIL]).toBe(true);
      expect(campaignCompletedPref!.channels[NotificationChannel.WEBSITE]).toBe(false);
      expect(campaignCompletedPref!.channels[NotificationChannel.BROWSER]).toBe(true); // Default value
    });

    it('should return all defaults when user has no preferences', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getUserPreferences('user-123');

      expect(result.preferences).toHaveLength(Object.keys(NotificationType).length);
      
      // Check that all notification types are present with defaults
      Object.values(NotificationType).forEach(type => {
        const pref = result.preferences.find(p => p.type === type);
        expect(pref).toBeDefined();
        expect(pref!.channels).toHaveProperty(NotificationChannel.EMAIL);
        expect(pref!.channels).toHaveProperty(NotificationChannel.WEBSITE);
        expect(pref!.channels).toHaveProperty(NotificationChannel.BROWSER);
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should delete existing preferences and save new ones', async () => {
      const updateDto: UpdatePreferencesDto = {
        preferences: [
          {
            type: NotificationType.CAMPAIGN_COMPLETED,
            channels: {
              [NotificationChannel.EMAIL]: true,
              [NotificationChannel.WEBSITE]: false,
              [NotificationChannel.BROWSER]: true,
            },
          },
          {
            type: NotificationType.CAMPAIGN_FAILED,
            channels: {
              [NotificationChannel.EMAIL]: false,
              [NotificationChannel.WEBSITE]: true,
              [NotificationChannel.BROWSER]: false,
            },
          },
        ],
      };

      mockRepository.delete.mockResolvedValue(undefined);
      mockRepository.save.mockResolvedValue(undefined);

      await service.updateUserPreferences('user-123', updateDto);

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockRepository.save).toHaveBeenCalledWith([
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
          enabled: false,
        },
        {
          userId: 'user-123',
          type: NotificationType.CAMPAIGN_COMPLETED,
          channel: NotificationChannel.BROWSER,
          enabled: true,
        },
        {
          userId: 'user-123',
          type: NotificationType.CAMPAIGN_FAILED,
          channel: NotificationChannel.EMAIL,
          enabled: false,
        },
        {
          userId: 'user-123',
          type: NotificationType.CAMPAIGN_FAILED,
          channel: NotificationChannel.WEBSITE,
          enabled: true,
        },
        {
          userId: 'user-123',
          type: NotificationType.CAMPAIGN_FAILED,
          channel: NotificationChannel.BROWSER,
          enabled: false,
        },
      ]);
    });

    it('should handle empty preferences', async () => {
      const updateDto: UpdatePreferencesDto = {
        preferences: [],
      };

      mockRepository.delete.mockResolvedValue(undefined);

      await service.updateUserPreferences('user-123', updateDto);

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('initializeDefaultPreferences', () => {
    it('should create default preferences for new user', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(undefined);

      await service.initializeDefaultPreferences('user-123');

      expect(mockRepository.count).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(mockRepository.save).toHaveBeenCalled();

      const savedPreferences = mockRepository.save.mock.calls[0][0];
      expect(savedPreferences).toHaveLength(
        Object.keys(NotificationType).length * Object.keys(NotificationChannel).length
      );
    });

    it('should not create preferences if user already has them', async () => {
      mockRepository.count.mockResolvedValue(5);

      await service.initializeDefaultPreferences('user-123');

      expect(mockRepository.count).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationTypeSettings', () => {
    it('should return notification type and channel metadata', async () => {
      const result = await service.getNotificationTypeSettings();

      expect(result.types).toHaveLength(Object.keys(NotificationType).length);
      expect(result.channels).toHaveLength(Object.keys(NotificationChannel).length);

      // Check that all types have required fields
      result.types.forEach(type => {
        expect(type).toHaveProperty('type');
        expect(type).toHaveProperty('title');
        expect(type).toHaveProperty('description');
        expect(type).toHaveProperty('category');
      });

      // Check that all channels have required fields
      result.channels.forEach(channel => {
        expect(channel).toHaveProperty('channel');
        expect(channel).toHaveProperty('title');
        expect(channel).toHaveProperty('description');
        expect(channel).toHaveProperty('icon');
      });
    });
  });
});