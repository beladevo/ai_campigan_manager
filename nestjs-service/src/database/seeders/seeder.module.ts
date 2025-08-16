import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';
import { UserSeeder } from './user.seeder';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Campaign])],
  providers: [UserSeeder, DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {}