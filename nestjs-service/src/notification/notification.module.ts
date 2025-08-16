import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { EmailService } from './services/email.service';
import { WebsiteNotificationService } from './services/website-notification.service';
import { NotificationController } from './notification.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationPreferenceService,
    EmailService,
    WebsiteNotificationService,
  ],
  exports: [
    NotificationService,
    NotificationPreferenceService,
    EmailService,
    WebsiteNotificationService,
  ],
})
export class NotificationModule {}