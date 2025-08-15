import { Module } from '@nestjs/common';
import { AuthSimpleController } from './auth-simple.controller';

@Module({
  controllers: [AuthSimpleController],
})
export class AuthSimpleModule {}