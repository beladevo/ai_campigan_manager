import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum CampaignStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum CampaignStep {
  QUEUED = 'queued',
  GENERATING_TEXT = 'generating_text',
  GENERATING_IMAGE = 'generating_image',
  FINALIZING = 'finalizing',
  DONE = 'done'
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.campaigns)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  prompt: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.PENDING
  })
  status: CampaignStatus;

  @Column({ name: 'generated_text', type: 'text', nullable: true })
  generatedText: string;

  @Column({ name: 'image_path', nullable: true })
  imagePath: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({
    type: 'enum',
    enum: CampaignStep,
    default: CampaignStep.QUEUED,
    nullable: true
  })
  currentStep: CampaignStep;

  @Column({ name: 'progress_percentage', type: 'integer', default: 0 })
  progressPercentage: number;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}