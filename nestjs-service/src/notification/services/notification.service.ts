import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../entities/notification.entity';
import { NotificationPreference, NotificationType, NotificationChannel } from '../entities/notification-preference.entity';
import { EmailService } from './email.service';
import { WebsiteNotificationService } from './website-notification.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  channels?: NotificationChannel[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private emailService: EmailService,
    private websiteNotificationService: WebsiteNotificationService,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<void> {
    const { userId, type, title, message, data, channels } = dto;

    // Get user preferences for this notification type
    const preferences = await this.getUserPreferences(userId, type);
    
    // Determine which channels to use
    const enabledChannels = channels || this.getDefaultChannels(type);
    
    for (const channel of enabledChannels) {
      // Check if user has enabled this channel for this notification type
      const isEnabled = preferences.some(pref => 
        pref.channel === channel && pref.enabled
      );

      if (!isEnabled) {
        this.logger.debug(`Skipping ${channel} notification for user ${userId} - disabled in preferences`);
        continue;
      }

      // Create notification record
      const notification = this.notificationRepository.create({
        userId,
        type,
        channel,
        title,
        message,
        data,
        status: NotificationStatus.PENDING,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      // Send notification via appropriate channel
      try {
        await this.sendNotification(savedNotification);
        
        // Update status to sent
        await this.notificationRepository.update(savedNotification.id, {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        });

        this.logger.log(`Sent ${channel} notification to user ${userId}: ${title}`);
      } catch (error) {
        this.logger.error(`Failed to send ${channel} notification to user ${userId}:`, error);
        
        // Update status to failed
        await this.notificationRepository.update(savedNotification.id, {
          status: NotificationStatus.FAILED,
          errorMessage: error.message,
        });
      }
    }
  }

  private async sendNotification(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await this.emailService.sendNotificationEmail(notification);
        break;
      case NotificationChannel.WEBSITE:
        await this.websiteNotificationService.sendWebsiteNotification(notification);
        break;
      case NotificationChannel.BROWSER:
        await this.websiteNotificationService.sendBrowserNotification(notification);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${notification.channel}`);
    }
  }

  private async getUserPreferences(userId: string, type: NotificationType): Promise<NotificationPreference[]> {
    return this.preferenceRepository.find({
      where: { userId, type },
    });
  }

  private getDefaultChannels(type: NotificationType): NotificationChannel[] {
    // Define default channels for each notification type
    switch (type) {
      case NotificationType.CAMPAIGN_COMPLETED:
      case NotificationType.CAMPAIGN_FAILED:
        return [NotificationChannel.WEBSITE, NotificationChannel.EMAIL, NotificationChannel.BROWSER];
      case NotificationType.SYSTEM_MAINTENANCE:
      case NotificationType.SUBSCRIPTION_EXPIRY:
        return [NotificationChannel.EMAIL, NotificationChannel.WEBSITE];
      case NotificationType.USAGE_LIMIT_WARNING:
      case NotificationType.USAGE_LIMIT_REACHED:
        return [NotificationChannel.WEBSITE, NotificationChannel.BROWSER];
      case NotificationType.NEW_FEATURES:
      case NotificationType.MARKETING:
        return [NotificationChannel.EMAIL];
      default:
        return [NotificationChannel.WEBSITE];
    }
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, channel: NotificationChannel.WEBSITE },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.SENT },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        channel: NotificationChannel.WEBSITE,
        status: NotificationStatus.SENT,
      },
    });
  }

  // Convenience methods for common notifications
  async notifyCampaignCompleted(userId: string, campaignId: string, campaignTitle: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CAMPAIGN_COMPLETED,
      title: '🎉 Campaign Complete!',
      message: `Your campaign "${campaignTitle}" has been successfully generated and is ready for use.`,
      data: { campaignId, campaignTitle },
    });
  }

  async notifyCampaignFailed(userId: string, campaignId: string, error: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CAMPAIGN_FAILED,
      title: '❌ Campaign Failed',
      message: `Your campaign generation failed: ${error}. Please try again or contact support.`,
      data: { campaignId, error },
    });
  }

  async notifyUsageLimit(userId: string, percentage: number, subscriptionTier: string): Promise<void> {
    const isWarning = percentage >= 80 && percentage < 100;
    const isReached = percentage >= 100;

    if (isReached) {
      await this.createNotification({
        userId,
        type: NotificationType.USAGE_LIMIT_REACHED,
        title: '🚨 Monthly Limit Reached',
        message: `You've reached your monthly campaign limit for the ${subscriptionTier} plan. Upgrade to continue creating campaigns.`,
        data: { percentage, subscriptionTier },
      });
    } else if (isWarning) {
      await this.createNotification({
        userId,
        type: NotificationType.USAGE_LIMIT_WARNING,
        title: '⚠️ Approaching Monthly Limit',
        message: `You've used ${percentage}% of your monthly campaign limit. Consider upgrading to avoid interruptions.`,
        data: { percentage, subscriptionTier },
      });
    }
  }
}