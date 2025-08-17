import {
  Injectable,
  Logger,
  NotFoundException,
  Controller,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventPattern } from "@nestjs/microservices";
import { Campaign, CampaignStatus, CampaignStep } from "./entities/campaign.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { CampaignResultMessage } from "../rabbitmq/types";
import { NotificationService } from "../notification/services/notification.service";
import { NotificationType } from "../notification/entities/notification-preference.entity";

@Controller()
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private rabbitMQService: RabbitMQService,
    private notificationService: NotificationService
  ) {}

  async create(createCampaignDto: CreateCampaignDto, user: any): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      userId: user.id,
      status: CampaignStatus.PENDING,
      currentStep: CampaignStep.QUEUED,
      progressPercentage: 0,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);
    this.logger.log(`Campaign created with ID: ${savedCampaign.id}`);

    try {
      await this.rabbitMQService.publishCampaignGeneration({
        campaignId: savedCampaign.id,
        prompt: savedCampaign.prompt,
      });

      await this.updateCampaignProgress(
        savedCampaign.id,
        CampaignStatus.PROCESSING,
        CampaignStep.QUEUED,
        10,
        new Date()
      );
      this.logger.log(`Campaign ${savedCampaign.id} queued for processing`);

      // Send campaign started notification
      try {
        await this.notificationService.createNotification({
          userId: user.id,
          type: NotificationType.CAMPAIGN_STARTED,
          title: '🚀 Campaign Generation Started',
          message: `Your campaign "${savedCampaign.prompt.substring(0, 50)}..." has been queued for generation.`,
          data: {
            campaignId: savedCampaign.id,
            campaignTitle: savedCampaign.prompt.substring(0, 50),
          },
        });
      } catch (notificationError) {
        this.logger.error(`Failed to send campaign started notification:`, notificationError);
      }
    } catch (error) {
      this.logger.error(`Failed to queue campaign ${savedCampaign.id}:`, error);
      await this.updateCampaignStatus(
        savedCampaign.id,
        CampaignStatus.FAILED,
        `Failed to queue: ${error.message}`
      );
    }

    return savedCampaign;
  }

  async findOne(id: string, user: any): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ 
      where: { id, userId: user.id } 
    });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async findByUser(userId: string): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  @EventPattern("campaign.result")
  async handleCampaignResult(message: any): Promise<void> {
    this.logger.log(
      `Received campaign result message: ${JSON.stringify(message)}`
    );

    let campaignData: CampaignResultMessage;

    try {
      if (message.data) {
        campaignData = message.data;
      } else if (message.campaignId) {
        campaignData = message;
      } else {
        this.logger.error(
          `Invalid message format received: ${JSON.stringify(message)}`
        );
        return;
      }

      const { campaignId, generatedText, imagePath, error } = campaignData;
      this.logger.log(`Processing campaign result for ID: ${campaignId}`);

      if (error) {
        this.logger.error(`Campaign ${campaignId} failed: ${error}`);
        await this.updateCampaignStatus(
          campaignId,
          CampaignStatus.FAILED,
          error
        );

        // Send campaign failed notification
        try {
          const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
          if (campaign) {
            await this.notificationService.createNotification({
              userId: campaign.userId,
              type: NotificationType.CAMPAIGN_FAILED,
              title: '❌ Campaign Generation Failed',
              message: `Your campaign "${campaign.prompt.substring(0, 50)}..." failed to generate. Please try again.`,
              data: {
                campaignId: campaignId,
                campaignTitle: campaign.prompt.substring(0, 50),
                error: error,
              },
            });
          }
        } catch (notificationError) {
          this.logger.error(`Failed to send campaign failed notification:`, notificationError);
        }
      } else {
        this.logger.log(`Campaign ${campaignId} completed successfully`);
        this.logger.log(`Generated text length: ${generatedText?.length || 0}`);
        this.logger.log(`Image path: ${imagePath}`);

        await this.campaignRepository.update(campaignId, {
          status: CampaignStatus.COMPLETED,
          generatedText,
          imagePath,
          errorMessage: null,
          currentStep: CampaignStep.DONE,
          progressPercentage: 100,
          completedAt: new Date(),
        });

        this.logger.log(
          `Database updated successfully for campaign ${campaignId}`
        );

        // Send campaign completed notification
        try {
          const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
          if (campaign) {
            await this.notificationService.createNotification({
              userId: campaign.userId,
              type: NotificationType.CAMPAIGN_COMPLETED,
              title: '🎉 Campaign Generation Complete!',
              message: `Your campaign "${campaign.prompt.substring(0, 50)}..." has been successfully generated and is ready to view.`,
              data: {
                campaignId: campaignId,
                campaignTitle: campaign.prompt.substring(0, 50),
                hasImage: !!imagePath,
                textLength: generatedText?.length || 0,
              },
            });
          }
        } catch (notificationError) {
          this.logger.error(`Failed to send campaign completed notification:`, notificationError);
        }
      }
    } catch (dbError) {
      this.logger.error(
        `Failed to update campaign ${
          campaignData?.campaignId || "unknown"
        } in database:`,
        dbError
      );
      this.logger.error(`Database error stack: ${dbError.stack}`);
    }
  }

  private async updateCampaignStatus(
    campaignId: string,
    status: CampaignStatus,
    errorMessage?: string
  ): Promise<void> {
    await this.campaignRepository.update(campaignId, {
      status,
      errorMessage,
    });
  }

  async updateCampaignProgress(
    campaignId: string,
    status: CampaignStatus,
    currentStep: CampaignStep,
    progressPercentage: number,
    startedAt?: Date
  ): Promise<void> {
    const updateData: any = {
      status,
      currentStep,
      progressPercentage,
    };

    if (startedAt) {
      updateData.startedAt = startedAt;
    }

    await this.campaignRepository.update(campaignId, updateData);
  }
}
