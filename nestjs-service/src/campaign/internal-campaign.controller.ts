import { Body, Controller, Put, Param, Logger } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignStatus, CampaignStep } from './entities/campaign.entity';

@Controller('internal/campaigns')
export class InternalCampaignController {
  private readonly logger = new Logger(InternalCampaignController.name);

  constructor(private readonly campaignService: CampaignService) {}

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
}