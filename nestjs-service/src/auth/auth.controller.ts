import { Controller, Post, Body, Get, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.logger.log(`Password reset requested for email: ${forgotPasswordDto.email}`);
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    this.logger.log('Password reset attempt');
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    this.logger.log('Email verification attempt');
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const { password, ...userWithoutPassword } = req.user;
    return { user: userWithoutPassword };
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Request() req) {
    const canCreateCampaign = await this.authService.checkUsageQuota(req.user.id);
    return {
      userId: req.user.id,
      subscriptionTier: req.user.subscriptionTier,
      campaignsUsedThisMonth: req.user.campaignsUsedThisMonth,
      canCreateCampaign,
    };
  }
}