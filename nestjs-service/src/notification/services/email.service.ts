import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service';
import { Notification } from '../entities/notification.entity';
import { NotificationType } from '../entities/notification-preference.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Configure SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // For development/testing
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP configuration error:', error);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendNotificationEmail(notification: Notification): Promise<void> {
    try {
      // Get user email from notification user relation
      const userEmail = await this.getUserEmail(notification.userId);
      
      if (!userEmail) {
        throw new Error(`No email found for user ${notification.userId}`);
      }

      const emailTemplate = this.getEmailTemplate(notification);
      
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || '"Solara AI" <noreply@solara.ai>',
        to: userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${userEmail}: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification:`, error);
      throw error;
    }
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // In a real implementation, you'd fetch this from the database
    // For now, we'll use a placeholder
    // TODO: Implement proper user lookup
    return 'user@example.com'; // Placeholder
  }

  private getEmailTemplate(notification: Notification): { subject: string; html: string; text: string } {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    switch (notification.type) {
      case NotificationType.CAMPAIGN_COMPLETED:
        return {
          subject: `🎉 Your Campaign is Ready! - Solara AI`,
          html: this.getCampaignCompletedHtml(notification, baseUrl),
          text: this.getCampaignCompletedText(notification, baseUrl),
        };

      case NotificationType.CAMPAIGN_FAILED:
        return {
          subject: `❌ Campaign Generation Failed - Solara AI`,
          html: this.getCampaignFailedHtml(notification, baseUrl),
          text: this.getCampaignFailedText(notification, baseUrl),
        };

      case NotificationType.USAGE_LIMIT_WARNING:
        return {
          subject: `⚠️ Approaching Monthly Limit - Solara AI`,
          html: this.getUsageLimitWarningHtml(notification, baseUrl),
          text: this.getUsageLimitWarningText(notification, baseUrl),
        };

      case NotificationType.USAGE_LIMIT_REACHED:
        return {
          subject: `🚨 Monthly Limit Reached - Solara AI`,
          html: this.getUsageLimitReachedHtml(notification, baseUrl),
          text: this.getUsageLimitReachedText(notification, baseUrl),
        };

      default:
        return {
          subject: notification.title,
          html: this.getDefaultHtml(notification, baseUrl),
          text: this.getDefaultText(notification, baseUrl),
        };
    }
  }

  private getCampaignCompletedHtml(notification: Notification, baseUrl: string): string {
    const campaignId = notification.data?.campaignId;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Complete</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Campaign Complete!</h1>
          </div>
          <div class="content">
            <h2>Your AI-generated content is ready!</h2>
            <p>Great news! Your campaign has been successfully generated and is ready for use.</p>
            <p><strong>Campaign ID:</strong> #${campaignId?.slice(-8) || 'N/A'}</p>
            <p>You can now view, edit, and publish your content.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${baseUrl}/campaigns/${campaignId}" class="button">View Campaign</a>
            </div>
            <p>Need help? Our support team is here to assist you!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Solara AI. All rights reserved.</p>
            <p>You're receiving this because you have notifications enabled for campaign updates.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCampaignCompletedText(notification: Notification, baseUrl: string): string {
    const campaignId = notification.data?.campaignId;
    return `
🎉 Campaign Complete!

Your AI-generated content is ready!

Campaign ID: #${campaignId?.slice(-8) || 'N/A'}

You can now view, edit, and publish your content.

View Campaign: ${baseUrl}/campaigns/${campaignId}

Need help? Our support team is here to assist you!

---
© 2024 Solara AI. All rights reserved.
You're receiving this because you have notifications enabled for campaign updates.
    `;
  }

  private getCampaignFailedHtml(notification: Notification, baseUrl: string): string {
    const error = notification.data?.error || 'Unknown error';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Failed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
          .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Campaign Failed</h1>
          </div>
          <div class="content">
            <h2>Campaign generation encountered an issue</h2>
            <p>We're sorry, but your campaign generation failed to complete successfully.</p>
            <div class="error-box">
              <strong>Error Details:</strong><br>
              ${error}
            </div>
            <p>Don't worry! You can try creating the campaign again, or contact our support team for assistance.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${baseUrl}/create" class="button">Try Again</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Solara AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCampaignFailedText(notification: Notification, baseUrl: string): string {
    const error = notification.data?.error || 'Unknown error';
    return `
❌ Campaign Failed

Campaign generation encountered an issue.

We're sorry, but your campaign generation failed to complete successfully.

Error Details: ${error}

Don't worry! You can try creating the campaign again, or contact our support team for assistance.

Try Again: ${baseUrl}/create

---
© 2024 Solara AI. All rights reserved.
    `;
  }

  private getUsageLimitWarningHtml(notification: Notification, baseUrl: string): string {
    const percentage = notification.data?.percentage || 0;
    const subscriptionTier = notification.data?.subscriptionTier || 'current';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Approaching Usage Limit</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
          .progress-bar { background: #f3f4f6; border-radius: 8px; height: 12px; margin: 16px 0; }
          .progress-fill { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); height: 100%; border-radius: 8px; width: ${percentage}%; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Approaching Monthly Limit</h1>
          </div>
          <div class="content">
            <h2>You've used ${percentage}% of your monthly campaigns</h2>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p>You're approaching your monthly campaign limit for the <strong>${subscriptionTier}</strong> plan.</p>
            <p>To continue creating unlimited campaigns, consider upgrading to a higher tier.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${baseUrl}/settings/billing" class="button">Upgrade Plan</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Solara AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getUsageLimitWarningText(notification: Notification, baseUrl: string): string {
    const percentage = notification.data?.percentage || 0;
    const subscriptionTier = notification.data?.subscriptionTier || 'current';
    
    return `
⚠️ Approaching Monthly Limit

You've used ${percentage}% of your monthly campaigns for the ${subscriptionTier} plan.

To continue creating unlimited campaigns, consider upgrading to a higher tier.

Upgrade Plan: ${baseUrl}/settings/billing

---
© 2024 Solara AI. All rights reserved.
    `;
  }

  private getUsageLimitReachedHtml(notification: Notification, baseUrl: string): string {
    const subscriptionTier = notification.data?.subscriptionTier || 'current';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Limit Reached</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Monthly Limit Reached</h1>
          </div>
          <div class="content">
            <h2>You've reached your monthly campaign limit</h2>
            <p>You've used all available campaigns for your <strong>${subscriptionTier}</strong> plan this month.</p>
            <p>To continue creating campaigns, please upgrade your plan or wait for your monthly limit to reset.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${baseUrl}/settings/billing" class="button">Upgrade Now</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Solara AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getUsageLimitReachedText(notification: Notification, baseUrl: string): string {
    const subscriptionTier = notification.data?.subscriptionTier || 'current';
    
    return `
🚨 Monthly Limit Reached

You've reached your monthly campaign limit for the ${subscriptionTier} plan.

To continue creating campaigns, please upgrade your plan or wait for your monthly limit to reset.

Upgrade Now: ${baseUrl}/settings/billing

---
© 2024 Solara AI. All rights reserved.
    `;
  }

  private getDefaultHtml(notification: Notification, baseUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notification.title}</h1>
          </div>
          <div class="content">
            <p>${notification.message}</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Solara AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultText(notification: Notification, baseUrl: string): string {
    return `
${notification.title}

${notification.message}

---
© 2024 Solara AI. All rights reserved.
    `;
  }
}