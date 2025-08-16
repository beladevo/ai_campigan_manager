import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DatabaseSeeder } from '../seeders/database.seeder';

async function bootstrap() {
  console.log('🌱 Solara AI Database Seeder');
  console.log('='.repeat(50));
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.run();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();