import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { UserResponse } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  private applySessionContext(
    profile: UserResponse | null,
    req: AuthenticatedRequest,
  ): UserResponse | null {
    if (!profile || !req.user.impersonationReadOnly) {
      return profile;
    }

    return {
      ...profile,
      status: 'SOFT_BLOCK',
      sessionMode: 'READ_ONLY',
      impersonationCompanyId: req.user.companyId,
      impersonationCompanyName: req.user.companyName,
      originalAdminUid: req.user.originalAdminUid,
    } as UserResponse;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authorized user' })
  async getMe(@Request() req: AuthenticatedRequest) {
    const { user } = req;
    const profile = await this.userService.findOrCreate({
      firebaseUid: user.uid,
      email: user.email || '',
      displayName:
        (user as { name?: string }).name ||
        (user as { displayName?: string }).displayName ||
        user.email?.split('@')[0] ||
        'Usuario de Pista 8',
      avatarUrl:
        (user as { picture?: string }).picture ||
        (user as { photoURL?: string }).photoURL,
    });

    return this.applySessionContext(profile, req);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current profile' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.getMe(req);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Force sync user profile with Firebase' })
  async syncUser(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      displayName?: string;
      avatarUrl?: string;
      preventCreation?: boolean;
    },
  ) {
    const { user } = req;
    return this.userService.findOrCreate(
      {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName:
          body.displayName ||
          user.displayName ||
          user.email?.split('@')[0] ||
          'Usuario de Pista 8',
        avatarUrl: body.avatarUrl,
      },
      true,
      body.preventCreation,
    );
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { user } = req;
    return this.userService.updateProfile(user.uid, updateUserDto);
  }

  @Patch('faculty')
  @ApiOperation({ summary: 'Update user faculty' })
  async updateFaculty(
    @Request() req: AuthenticatedRequest,
    @Body() body: { facultyId?: string | number },
  ) {
    const { user } = req;
    return this.userService.updateFaculty(user.uid, body);
  }

  @Get('faculties')
  @ApiOperation({ summary: 'Get all faculties' })
  async getFaculties() {
    return this.userService.getAllFaculties();
  }
}
