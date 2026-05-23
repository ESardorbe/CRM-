import {
  Controller, Post, Body, UseGuards, Get, Put, Param, Delete, Query, Req, Res,
} from '@nestjs/common';
import {
  ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { Roles } from './decorator/roles.decorator';
import { Role } from './enums/role.enum';
import { RoleGuard } from './guards/role.guard';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RegisterWithRoleDto } from './dto/register-with-role.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify Email' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmailCode(verifyEmailDto.email, verifyEmailDto.verifyCode);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update Password' })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.updatePassword(updatePasswordDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  async logout(@GetCurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return { message: 'Successfully logged out' };
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get Current User Profile' })
  async getProfile(@GetCurrentUserId() userId: string) {
    return this.authService.findUserById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update User Profile' })
  async updateProfile(
    @GetCurrentUserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  // ─── User Management (Admin + SuperAdmin) ────────────────────────────────

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('all-users')
  @ApiOperation({ summary: 'Get All Users (Admin/SuperAdmin)' })
  @ApiOkResponse({ description: 'Paginated list of all users' })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.authService.getAllUsers(
      Number(page) || 1,
      Number(limit) || 10,
      search,
    );
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Get('users/role/:role')
  @ApiOperation({ summary: 'Get Users by Role' })
  getUsersByRole(@Param('role') role: string) {
    return this.authService.getUsersByRole(role);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update User Role' })
  updateUserRole(
    @Param('id') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.authService.updateUserRole(userId, updateRoleDto.role);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.SuperAdmin)
  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete User (SuperAdmin only)' })
  deleteUser(@Param('id') userId: string) {
    return this.authService.deleteUser(userId);
  }

  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @Post('register-with-role')
  @ApiOperation({ summary: 'Register User with Role (Admin/SuperAdmin)' })
  async registerWithRole(@Body() registerWithRoleDto: RegisterWithRoleDto) {
    return this.authService.registerWithRole(registerWithRoleDto);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth redirect' })
  googleAuth() {
    // Passport handles the redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: any, @Res() res: any) {
    const tokens = await this.authService.handleGoogleCallback(req.user);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
