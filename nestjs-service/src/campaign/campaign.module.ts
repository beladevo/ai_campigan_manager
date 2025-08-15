import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Campaign } from './entities/campaign.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign]), RabbitMQModule, WebSocketModule, AuthModule],
  controllers: [CampaignController, CampaignService],
  providers: [CampaignService],
})
export class CampaignModule {}
