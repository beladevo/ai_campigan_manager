import { Controller, Post, Body, Logger } from '@nestjs/common';

interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Controller('auth')
export class AuthSimpleController {
  private readonly logger = new Logger(AuthSimpleController.name);

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    // Simple mock response for testing
    return {
      message: 'Registration endpoint working',
      user: {
        id: '123',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
      token: 'mock-jwt-token'
    };
  }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    
    return {
      message: 'Login endpoint working',
      user: {
        id: '123',
        email: loginDto.email,
      },
      token: 'mock-jwt-token'
    };
  }
}