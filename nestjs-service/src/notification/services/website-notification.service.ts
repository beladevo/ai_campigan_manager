import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Notification } from '../entities/notification.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class WebsiteNotificationService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsiteNotificationService.name);

  async sendWebsiteNotification(notification: Notification): Promise<void> {
    try {
      // Send to user's specific room
      const userRoom = `user_${notification.userId}`;
      
      const notificationData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        createdAt: notification.createdAt,
        status: notification.status,
      };

      this.server.to(userRoom).emit('notification', notificationData);
      
      this.logger.log(`Website notification sent to user ${notification.userId}: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send website notification:`, error);
      throw error;
    }
  }

  async sendBrowserNotification(notification: Notification): Promise<void> {
    try {
      // Send browser notification data to the client via WebSocket
      // The client will handle the actual browser notification display
      const userRoom = `user_${notification.userId}`;
      
      const browserNotificationData = {
        title: notification.title,
        message: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `campaign_${notification.data?.campaignId}`,
        requireInteraction: false,
        data: notification.data,
      };

      this.server.to(userRoom).emit('browser_notification', browserNotificationData);
      
      this.logger.log(`Browser notification sent to user ${notification.userId}: ${notification.title}`);
    } catch (error) {
      this.logger.error(`Failed to send browser notification:`, error);
      throw error;
    }
  }

  // Utility method to send real-time updates for campaigns
  async sendCampaignUpdate(userId: string, campaignId: string, status: string, data?: any): Promise<void> {
    try {
      const userRoom = `user_${userId}`;
      
      const updateData = {
        type: 'campaign_update',
        campaignId,
        status,
        timestamp: new Date(),
        data,
      };

      this.server.to(userRoom).emit('campaign_update', updateData);
      
      this.logger.log(`Campaign update sent to user ${userId}: Campaign ${campaignId} is ${status}`);
    } catch (error) {
      this.logger.error(`Failed to send campaign update:`, error);
    }
  }

  // Method to send system-wide announcements
  async sendSystemAnnouncement(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    try {
      const announcementData = {
        type: 'system_announcement',
        title,
        message,
        level: type,
        timestamp: new Date(),
      };

      this.server.emit('system_announcement', announcementData);
      
      this.logger.log(`System announcement sent: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send system announcement:`, error);
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.server.sockets.sockets.size;
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    const userRoom = `user_${userId}`;
    const room = this.server.sockets.adapter.rooms.get(userRoom);
    return room ? room.size > 0 : false;
  }
}