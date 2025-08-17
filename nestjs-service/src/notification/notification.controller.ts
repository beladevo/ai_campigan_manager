import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService, UpdatePreferencesDto } from './services/notification-preference.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) || 20 : 20;
    
    const notifications = await this.notificationService.getUserNotifications(userId, limitNum);
    return { notifications };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.userId;
    await this.notificationService.markNotificationAsRead(notificationId, userId);
    return { success: true };
  }

  @Put('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    await this.notificationService.markAllNotificationsAsRead(userId);
    return { success: true };
  }

  @Get('preferences')
  async getUserPreferences(@Request() req) {
    const userId = req.user.userId;
    return await this.preferenceService.getUserPreferences(userId);
  }

  @Put('preferences')
  async updateUserPreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    const userId = req.user.userId;
    await this.preferenceService.updateUserPreferences(userId, dto);
    return { success: true };
  }

  @Get('preferences/settings')
  async getNotificationSettings() {
    return await this.preferenceService.getNotificationTypeSettings();
  }

  @Post('test/:type')
  async sendTestNotification(@Request() req, @Param('type') type: string) {
    const userId = req.user.userId;
    
    // Send a test notification (for development/testing)
    const testMessages = {
      campaign_completed: {
        title: '🎉 Test Campaign Complete!',
        message: 'This is a test notification for campaign completion.',
        data: { campaignId: 'test-123', campaignTitle: 'Test Campaign' },
      },
      campaign_failed: {
        title: '❌ Test Campaign Failed',
        message: 'This is a test notification for campaign failure.',
        data: { campaignId: 'test-123', error: 'Test error message' },
      },
      usage_limit_warning: {
        title: '⚠️ Test Usage Warning',
        message: 'This is a test notification for usage limit warning.',
        data: { percentage: 85, subscriptionTier: 'premium' },
      },
    };

    const testMessage = testMessages[type as keyof typeof testMessages];
    if (!testMessage) {
      return { error: 'Invalid test notification type' };
    }

    await this.notificationService.createNotification({
      userId,
      type: type as any,
      title: testMessage.title,
      message: testMessage.message,
      data: testMessage.data,
    });

    return { success: true, message: 'Test notification sent' };
  }
}