import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CAMPAIGN_FAILED = 'campaign_failed', 
  CAMPAIGN_STARTED = 'campaign_started',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SUBSCRIPTION_EXPIRY = 'subscription_expiry',
  USAGE_LIMIT_WARNING = 'usage_limit_warning',
  USAGE_LIMIT_REACHED = 'usage_limit_reached',
  NEW_FEATURES = 'new_features',
  MARKETING = 'marketing'
}

export enum NotificationChannel {
  EMAIL = 'email',
  WEBSITE = 'website',
  BROWSER = 'browser'
}

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.notificationPreferences)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel
  })
  channel: NotificationChannel;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}