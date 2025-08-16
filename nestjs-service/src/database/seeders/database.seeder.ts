import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(private readonly userSeeder: UserSeeder) {}

  async run() {
    console.log('🌱 Starting database seeding...');
    console.log('='.repeat(50));
    
    try {
      await this.userSeeder.seed();
      
      console.log('='.repeat(50));
      console.log('🎉 Database seeding completed successfully!');
      console.log('');
      console.log('📋 Available test accounts:');
      console.log('👑 admin@solara.ai (Admin, Enterprise)');
      console.log('👑 mock@admin.com (Admin, Enterprise)');
      console.log('👤 mock@user.com (User, Premium)');
      console.log('👤 john.doe@example.com (User, Business)');
      console.log('👤 jane.smith@company.com (User, Business)');
      console.log('👤 marketer@startup.io (User, Premium)');
      console.log('👤 freelancer@creative.co (User, Free)');
      console.log('👤 agency@digital.com (User, Enterprise)');
      console.log('👤 newbie@trial.com (User, Free)');
      console.log('👤 poweruser@enterprise.corp (User, Enterprise)');
      console.log('');
      console.log('🔑 All passwords: password123');
      console.log('='.repeat(50));
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}