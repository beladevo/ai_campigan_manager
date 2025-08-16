import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, SubscriptionTier } from '../../user/entities/user.entity';
import { Campaign, CampaignStatus, CampaignStep } from '../../campaign/entities/campaign.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async seed() {
    console.log('🌱 Seeding users and sample data...');

    // Check if users already exist
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('📊 Users already exist, skipping seed...');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Mock users with different roles and subscriptions
    const mockUsers = [
      {
        email: 'admin@solara.ai',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        emailVerified: true,
        campaignsUsedThisMonth: 45,
        monthlyLimitResetDate: new Date(2024, 11, 1), // December 1st, 2024
        lastLogin: new Date(),
      },
      {
        email: 'mock@admin.com',
        password: hashedPassword,
        firstName: 'Mock',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        emailVerified: true,
        campaignsUsedThisMonth: 23,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        email: 'mock@user.com',
        password: hashedPassword,
        firstName: 'Mock',
        lastName: 'User',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.PREMIUM,
        emailVerified: true,
        campaignsUsedThisMonth: 67,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.BUSINESS,
        emailVerified: true,
        campaignsUsedThisMonth: 89,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        email: 'jane.smith@company.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.BUSINESS,
        emailVerified: true,
        campaignsUsedThisMonth: 34,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        email: 'marketer@startup.io',
        password: hashedPassword,
        firstName: 'Marketing',
        lastName: 'Pro',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.PREMIUM,
        emailVerified: true,
        campaignsUsedThisMonth: 56,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        email: 'freelancer@creative.co',
        password: hashedPassword,
        firstName: 'Creative',
        lastName: 'Freelancer',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.FREE,
        emailVerified: true,
        campaignsUsedThisMonth: 8,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        email: 'agency@digital.com',
        password: hashedPassword,
        firstName: 'Digital',
        lastName: 'Agency',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        emailVerified: true,
        campaignsUsedThisMonth: 234,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        email: 'newbie@trial.com',
        password: hashedPassword,
        firstName: 'Trial',
        lastName: 'User',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.FREE,
        emailVerified: false,
        campaignsUsedThisMonth: 2,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        email: 'poweruser@enterprise.corp',
        password: hashedPassword,
        firstName: 'Enterprise',
        lastName: 'PowerUser',
        role: UserRole.USER,
        subscriptionTier: SubscriptionTier.ENTERPRISE,
        emailVerified: true,
        campaignsUsedThisMonth: 445,
        monthlyLimitResetDate: new Date(2024, 11, 1),
        lastLogin: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
    ];

    // Create users
    const createdUsers = [];
    for (const userData of mockUsers) {
      try {
        const user = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(user);
        createdUsers.push(savedUser);
        console.log(`✅ Created user: ${savedUser.email} (${savedUser.role}, ${savedUser.subscriptionTier})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log(`🎉 Successfully created ${createdUsers.length} users!`);

    // Create sample campaigns for some users
    await this.seedCampaigns(createdUsers);
  }

  private async seedCampaigns(users: User[]) {
    console.log('📝 Creating sample campaigns...');

    const samplePrompts = [
      'Create a compelling product launch announcement for our new AI-powered marketing tool',
      'Write engaging social media copy for a sustainable fashion brand targeting millennials',
      'Generate email marketing content for a Black Friday sale with 40% off',
      'Create blog content about the future of remote work in 2024',
      'Write ad copy for a fitness app targeting busy professionals',
      'Generate content for a tech startup funding announcement',
      'Create a product review for wireless headphones',
      'Write a welcome email series for new software subscribers',
      'Generate LinkedIn content about leadership in digital transformation',
      'Create Instagram captions for a travel photography account',
      'Write compelling copy for a SaaS landing page',
      'Generate newsletter content about cryptocurrency trends',
      'Create sales email templates for B2B software sales',
      'Write product descriptions for eco-friendly home products',
      'Generate Facebook ad copy for online cooking courses',
    ];

    const sampleGeneratedTexts = [
      `# 🚀 Introducing SolaraAI: Your Marketing Game-Changer

We're thrilled to announce the launch of **SolaraAI** - the revolutionary AI-powered marketing tool that's about to transform how you create content!

## What makes SolaraAI special?

- **Lightning-fast content generation** in seconds
- **Multi-platform optimization** for all your channels  
- **Advanced AI** that understands your brand voice
- **Real-time analytics** to track performance

> "SolaraAI has increased our content output by 300% while maintaining quality" - Marketing Director, TechCorp

Ready to experience the future of marketing? Get started today!`,

      `# Sustainable Style, Conscious Choice 🌱

Fashion doesn't have to cost the earth. Our new **eco-luxe collection** proves that sustainable can be stylish.

## Why choose sustainable fashion?

✨ **Reduce environmental impact**  
✨ **Support ethical manufacturing**  
✨ **Invest in quality pieces that last**  
✨ **Express your values through style**

Every piece in our collection is:
- Made from recycled or organic materials
- Produced in fair-trade facilities
- Designed to last for years, not seasons

**Join the sustainable fashion revolution** - because looking good should feel good too! 

*Shop the collection now and get 20% off your first sustainable purchase.*`,

      `# BLACK FRIDAY MEGA SALE! 🔥

**40% OFF EVERYTHING** - Our biggest sale of the year is HERE!

## Don't Miss Out On:

- **Electronics** - Latest gadgets at unbeatable prices
- **Fashion** - Trending styles for less
- **Home & Garden** - Transform your space
- **Books & Media** - Feed your mind

### ⏰ Limited Time Offer
**Sale ends Monday at midnight!**

### 🚚 FREE SHIPPING
On all orders over $50

**Use code: BLACKFRIDAY40**

*This is your chance to grab everything on your wishlist. Don't wait - these deals won't last!*

[SHOP NOW] [Browse Categories] [View All Deals]`,
    ];

    const campaigns = [];
    const campaignCount = Math.min(50, users.length * 5); // Create up to 50 campaigns

    for (let i = 0; i < campaignCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      const randomGeneratedText = sampleGeneratedTexts[Math.floor(Math.random() * sampleGeneratedTexts.length)];
      
      // Create campaigns with varied statuses and timestamps
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
      const status = this.getRandomStatus();
      
      const campaign = this.campaignRepository.create({
        user: randomUser,
        prompt: randomPrompt,
        status: status,
        generatedText: status === CampaignStatus.COMPLETED ? randomGeneratedText : null,
        imagePath: status === CampaignStatus.COMPLETED ? `campaign_${i}_generated.png` : null,
        errorMessage: status === CampaignStatus.FAILED ? 'Mock error for demonstration' : null,
        progressPercentage: this.getProgressForStatus(status),
        currentStep: this.getStepForStatus(status),
        startedAt: status !== CampaignStatus.PENDING ? createdDate : null,
        completedAt: status === CampaignStatus.COMPLETED ? new Date(createdDate.getTime() + 60000) : null,
        createdAt: createdDate,
        updatedAt: status === CampaignStatus.COMPLETED ? new Date(createdDate.getTime() + 60000) : createdDate,
      });

      campaigns.push(campaign);
    }

    try {
      const savedCampaigns = await this.campaignRepository.save(campaigns);
      console.log(`✅ Created ${savedCampaigns.length} sample campaigns!`);
    } catch (error) {
      console.error('❌ Failed to create campaigns:', error.message);
    }
  }

  private getRandomStatus(): CampaignStatus {
    const statuses = [
      CampaignStatus.COMPLETED,
      CampaignStatus.COMPLETED,
      CampaignStatus.COMPLETED,
      CampaignStatus.COMPLETED, // Weight towards completed
      CampaignStatus.PROCESSING,
      CampaignStatus.PENDING,
      CampaignStatus.FAILED,
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getProgressForStatus(status: CampaignStatus): number {
    switch (status) {
      case CampaignStatus.PENDING: return 0;
      case CampaignStatus.PROCESSING: return Math.floor(Math.random() * 80) + 10; // 10-90%
      case CampaignStatus.COMPLETED: return 100;
      case CampaignStatus.FAILED: return Math.floor(Math.random() * 50); // 0-50%
      default: return 0;
    }
  }

  private getStepForStatus(status: CampaignStatus): CampaignStep {
    switch (status) {
      case CampaignStatus.PENDING: return CampaignStep.QUEUED;
      case CampaignStatus.PROCESSING: 
        const steps = [CampaignStep.GENERATING_TEXT, CampaignStep.GENERATING_IMAGE, CampaignStep.FINALIZING];
        return steps[Math.floor(Math.random() * steps.length)];
      case CampaignStatus.COMPLETED: return CampaignStep.DONE;
      case CampaignStatus.FAILED: return CampaignStep.QUEUED;
      default: return CampaignStep.QUEUED;
    }
  }
}