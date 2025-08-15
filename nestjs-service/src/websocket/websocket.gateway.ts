import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Campaign } from '../campaign/entities/campaign.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class CampaignWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');
  private userRooms: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.userRooms.delete(client.id);
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    this.userRooms.set(client.id, userId);
    client.join(`user-${userId}`);
    this.logger.log(`Client ${client.id} joined room for user ${userId}`);
    
    // Send confirmation
    client.emit('joined-room', { userId, message: 'Successfully joined user room' });
  }

  @SubscribeMessage('leave-user-room')
  handleLeaveUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    client.leave(`user-${userId}`);
    this.userRooms.delete(client.id);
    this.logger.log(`Client ${client.id} left room for user ${userId}`);
  }

  // Method to broadcast campaign updates to specific user
  broadcastCampaignUpdate(userId: string, campaign: Campaign) {
    this.server.to(`user-${userId}`).emit('campaign-update', {
      campaignId: campaign.id,
      status: campaign.status,
      campaign: campaign,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Broadcasted campaign update for user ${userId}, campaign ${campaign.id}: ${campaign.status}`);
  }

  // Method to broadcast campaign creation to specific user
  broadcastCampaignCreated(userId: string, campaign: Campaign) {
    this.server.to(`user-${userId}`).emit('campaign-created', {
      campaignId: campaign.id,
      campaign: campaign,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Broadcasted campaign creation for user ${userId}, campaign ${campaign.id}`);
  }

  // Method to broadcast error messages
  broadcastError(userId: string, error: { message: string; campaignId?: string }) {
    this.server.to(`user-${userId}`).emit('campaign-error', {
      ...error,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Broadcasted error for user ${userId}: ${error.message}`);
  }

  // Method to send general notifications
  broadcastNotification(userId: string, notification: { type: string; message: string; data?: any }) {
    this.server.to(`user-${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Sent notification to user ${userId}: ${notification.message}`);
  }
}