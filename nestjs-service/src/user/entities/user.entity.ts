import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Campaign } from '../../campaign/entities/campaign.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE
  })
  subscriptionTier: SubscriptionTier;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string;

  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  passwordResetExpires: Date;

  @Column({ name: 'campaigns_used_this_month', default: 0 })
  campaignsUsedThisMonth: number;

  @Column({ name: 'monthly_limit_reset_date', nullable: true })
  monthlyLimitResetDate: Date;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @OneToMany(() => Campaign, campaign => campaign.user)
  campaigns: Campaign[];

  @OneToMany('NotificationPreference', 'user')
  notificationPreferences: any[];

  @OneToMany('Notification', 'user')
  notifications: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}