import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference, NotificationType, NotificationChannel } from '../entities/notification-preference.entity';

export interface UpdatePreferencesDto {
  preferences: {
    type: NotificationType;
    channels: {
      [key in NotificationChannel]?: boolean;
    };
  }[];
}

export interface NotificationPreferencesResponse {
  preferences: {
    type: NotificationType;
    channels: {
      [key in NotificationChannel]: boolean;
    };
  }[];
}

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async getUserPreferences(userId: string): Promise<NotificationPreferencesResponse> {
    const preferences = await this.preferenceRepository.find({
      where: { userId },
    });

    // Create a map of preferences
    const preferenceMap = new Map<string, Map<NotificationChannel, boolean>>();
    
    preferences.forEach(pref => {
      const key = pref.type;
      if (!preferenceMap.has(key)) {
        preferenceMap.set(key, new Map());
      }
      preferenceMap.get(key)!.set(pref.channel, pref.enabled);
    });

    // Build response with all notification types and channels
    const result: NotificationPreferencesResponse = {
      preferences: []
    };

    // Ensure all notification types are represented
    Object.values(NotificationType).forEach(type => {
      const channels: { [key in NotificationChannel]: boolean } = {} as any;
      
      Object.values(NotificationChannel).forEach(channel => {
        const userPref = preferenceMap.get(type)?.get(channel);
        channels[channel] = userPref !== undefined ? userPref : this.getDefaultPreference(type, channel);
      });

      result.preferences.push({
        type,
        channels,
      });
    });

    return result;
  }

  async updateUserPreferences(userId: string, dto: UpdatePreferencesDto): Promise<void> {
    // Remove all existing preferences for this user
    await this.preferenceRepository.delete({ userId });

    // Create new preferences
    const preferencesToSave: Partial<NotificationPreference>[] = [];

    dto.preferences.forEach(pref => {
      Object.entries(pref.channels).forEach(([channel, enabled]) => {
        if (enabled !== undefined) {
          preferencesToSave.push({
            userId,
            type: pref.type,
            channel: channel as NotificationChannel,
            enabled,
          });
        }
      });
    });

    if (preferencesToSave.length > 0) {
      await this.preferenceRepository.save(preferencesToSave);
    }

    this.logger.log(`Updated notification preferences for user ${userId}`);
  }

  async initializeDefaultPreferences(userId: string): Promise<void> {
    // Check if user already has preferences
    const existingCount = await this.preferenceRepository.count({ where: { userId } });
    
    if (existingCount > 0) {
      this.logger.debug(`User ${userId} already has notification preferences`);
      return;
    }

    // Create default preferences
    const defaultPreferences: Partial<NotificationPreference>[] = [];

    Object.values(NotificationType).forEach(type => {
      Object.values(NotificationChannel).forEach(channel => {
        defaultPreferences.push({
          userId,
          type,
          channel,
          enabled: this.getDefaultPreference(type, channel),
        });
      });
    });

    await this.preferenceRepository.save(defaultPreferences);
    this.logger.log(`Initialized default notification preferences for user ${userId}`);
  }

  private getDefaultPreference(type: NotificationType, channel: NotificationChannel): boolean {
    // Define default preferences based on notification type and channel
    const defaults: { [key in NotificationType]: { [key in NotificationChannel]: boolean } } = {
      [NotificationType.CAMPAIGN_COMPLETED]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: true,
      },
      [NotificationType.CAMPAIGN_FAILED]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: true,
      },
      [NotificationType.CAMPAIGN_STARTED]: {
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: false,
      },
      [NotificationType.SYSTEM_MAINTENANCE]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: false,
      },
      [NotificationType.SUBSCRIPTION_EXPIRY]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: false,
      },
      [NotificationType.USAGE_LIMIT_WARNING]: {
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: true,
      },
      [NotificationType.USAGE_LIMIT_REACHED]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: true,
        [NotificationChannel.BROWSER]: true,
      },
      [NotificationType.NEW_FEATURES]: {
        [NotificationChannel.EMAIL]: true,
        [NotificationChannel.WEBSITE]: false,
        [NotificationChannel.BROWSER]: false,
      },
      [NotificationType.MARKETING]: {
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.WEBSITE]: false,
        [NotificationChannel.BROWSER]: false,
      },
    };

    return defaults[type]?.[channel] ?? false;
  }

  async getNotificationTypeSettings(): Promise<{
    types: {
      type: NotificationType;
      title: string;
      description: string;
      category: string;
    }[];
    channels: {
      channel: NotificationChannel;
      title: string;
      description: string;
      icon: string;
    }[];
  }> {
    return {
      types: [
        {
          type: NotificationType.CAMPAIGN_COMPLETED,
          title: 'Campaign Completed',
          description: 'When your AI-generated campaign is ready',
          category: 'Campaign Updates',
        },
        {
          type: NotificationType.CAMPAIGN_FAILED,
          title: 'Campaign Failed',
          description: 'When campaign generation encounters an error',
          category: 'Campaign Updates',
        },
        {
          type: NotificationType.CAMPAIGN_STARTED,
          title: 'Campaign Started',
          description: 'When your campaign generation begins',
          category: 'Campaign Updates',
        },
        {
          type: NotificationType.USAGE_LIMIT_WARNING,
          title: 'Usage Limit Warning',
          description: 'When approaching your monthly campaign limit',
          category: 'Account & Billing',
        },
        {
          type: NotificationType.USAGE_LIMIT_REACHED,
          title: 'Usage Limit Reached',
          description: 'When you\'ve reached your monthly campaign limit',
          category: 'Account & Billing',
        },
        {
          type: NotificationType.SUBSCRIPTION_EXPIRY,
          title: 'Subscription Expiry',
          description: 'When your subscription is about to expire',
          category: 'Account & Billing',
        },
        {
          type: NotificationType.SYSTEM_MAINTENANCE,
          title: 'System Maintenance',
          description: 'Important system updates and maintenance notices',
          category: 'System',
        },
        {
          type: NotificationType.NEW_FEATURES,
          title: 'New Features',
          description: 'Announcements about new features and improvements',
          category: 'Product Updates',
        },
        {
          type: NotificationType.MARKETING,
          title: 'Marketing & Promotions',
          description: 'Special offers, tips, and promotional content',
          category: 'Marketing',
        },
      ],
      channels: [
        {
          channel: NotificationChannel.EMAIL,
          title: 'Email',
          description: 'Receive notifications via email',
          icon: 'mail',
        },
        {
          channel: NotificationChannel.WEBSITE,
          title: 'Website',
          description: 'Show notifications in the app',
          icon: 'globe',
        },
        {
          channel: NotificationChannel.BROWSER,
          title: 'Browser',
          description: 'Send browser push notifications',
          icon: 'bell',
        },
      ],
    };
  }
}