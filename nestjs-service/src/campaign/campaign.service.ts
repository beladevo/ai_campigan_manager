import {
  Injectable,
  Logger,
  NotFoundException,
  Controller,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventPattern } from "@nestjs/microservices";
import { Campaign, CampaignStatus } from "./entities/campaign.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { CampaignResultMessage } from "../rabbitmq/types";
import { CampaignWebSocketGateway } from "../websocket/websocket.gateway";
import { AuthService } from "../auth/auth.service";
import { User } from "../user/entities/user.entity";

@Controller()
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private rabbitMQService: RabbitMQService,
    private webSocketGateway: CampaignWebSocketGateway,
    private authService: AuthService
  ) {}

  async create(createCampaignDto: CreateCampaignDto, user: User): Promise<Campaign> {
    // Check usage quota
    const canCreateCampaign = await this.authService.checkUsageQuota(user.id);
    if (!canCreateCampaign) {
      throw new ForbiddenException('Monthly campaign limit reached. Please upgrade your subscription.');
    }
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      userId: user.id,
      status: CampaignStatus.PENDING,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);
    this.logger.log(`Campaign created with ID: ${savedCampaign.id}`);

    // Increment user's campaign usage
    await this.authService.incrementUsage(user.id);

    // Broadcast campaign creation via WebSocket
    this.webSocketGateway.broadcastCampaignCreated(savedCampaign.userId, savedCampaign);

    try {
      await this.rabbitMQService.publishCampaignGeneration({
        campaignId: savedCampaign.id,
        prompt: savedCampaign.prompt,
      });

      await this.updateCampaignStatus(
        savedCampaign.id,
        CampaignStatus.PROCESSING
      );
      this.logger.log(`Campaign ${savedCampaign.id} queued for processing`);
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

  async findOne(id: string, user?: User): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    // Enforce ownership unless user is admin
    if (user && user.role !== 'admin' && campaign.userId !== user.id) {
      throw new ForbiddenException('Access denied to this campaign');
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
      // Handle different message formats
      if (message.data) {
        // NestJS microservice format: {pattern: "campaign.result", data: {...}}
        campaignData = message.data;
      } else if (message.campaignId) {
        // Direct format
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
      } else {
        this.logger.log(`Campaign ${campaignId} completed successfully`);
        this.logger.log(`Generated text length: ${generatedText?.length || 0}`);
        this.logger.log(`Image path: ${imagePath}`);

        await this.campaignRepository.update(campaignId, {
          status: CampaignStatus.COMPLETED,
          generatedText,
          imagePath,
          errorMessage: null,
        });

        // Get the updated campaign and broadcast via WebSocket
        const completedCampaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
        if (completedCampaign) {
          this.webSocketGateway.broadcastCampaignUpdate(completedCampaign.userId, completedCampaign);
        }

        this.logger.log(
          `Database updated successfully for campaign ${campaignId}`
        );
      }
    } catch (dbError) {
      this.logger.error(
        `Failed to update campaign ${
          campaignData?.campaignId || "unknown"
        } in database:`,
        dbError
      );
      this.logger.error(`Database error stack: ${dbError.stack}`);
      // Could potentially publish to a dead letter queue here
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

    // Get the updated campaign and broadcast via WebSocket
    const updatedCampaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (updatedCampaign) {
      this.webSocketGateway.broadcastCampaignUpdate(updatedCampaign.userId, updatedCampaign);
      
      if (status === CampaignStatus.FAILED && errorMessage) {
        this.webSocketGateway.broadcastError(updatedCampaign.userId, {
          message: errorMessage,
          campaignId: campaignId
        });
      }
    }
  }
}
