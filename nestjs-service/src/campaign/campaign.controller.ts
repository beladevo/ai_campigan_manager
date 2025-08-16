import { Body, Controller, Get, Param, Post, Put, Logger, UseGuards, Request } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, CampaignStatus, CampaignStep } from './entities/campaign.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  private readonly logger = new Logger(CampaignController.name);

  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto, @Request() req): Promise<Campaign> {
    this.logger.log(`Creating campaign for user: ${req.user.id}`);
    return this.campaignService.create(createCampaignDto, req.user);
  }

  @Get('my-campaigns')
  async getMyCampaigns(@Request() req): Promise<Campaign[]> {
    this.logger.log(`Fetching campaigns for user: ${req.user.id}`);
    return this.campaignService.findByUser(req.user.id);
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string, @Request() req): Promise<Campaign> {
    this.logger.log(`Fetching campaign with ID: ${id}`);
    return this.campaignService.findOne(id, req.user);
  }

  @Put(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() body: {
      status: CampaignStatus;
      currentStep: CampaignStep;
      progressPercentage: number;
    }
  ) {
    this.logger.log(`Updating progress for campaign ${id}: ${body.currentStep} (${body.progressPercentage}%)`);
    await this.campaignService.updateCampaignProgress(
      id,
      body.status,
      body.currentStep,
      body.progressPercentage
    );
    return { status: 'progress updated' };
  }

  @Post('test-queue')
  async testQueue(@Body() body: { message: string }) {
    this.logger.log(`Testing queue with message: ${body.message}`);
    return { status: 'Message sent for testing', message: body.message };
  }
}