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
import { UserService } from '../../Services/user.service';
import { UpdateUserDto } from '../../DTOs/update-user.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.interface';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authorized user' })
  async getMe(@Request() req: AuthenticatedRequest) {
    const { user } = req;
    return this.userService.findOrCreate({
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
    @Body() body: { displayName?: string; avatarUrl?: string; preventCreation?: boolean },
  ) {
    const { user } = req;
    return this.userService.findOrCreate(
      {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName:
          body.displayName ||
          (user as { name?: string }).name ||
          (user as { displayName?: string }).displayName ||
          user.email?.split('@')[0] ||
          'Usuario de Pista 8',
        avatarUrl:
          body.avatarUrl ||
          (user as { picture?: string }).picture ||
          (user as { photoURL?: string }).photoURL,
      },
      true,
      body.preventCreation,
    );
  }

  @Patch('bio')
  @ApiOperation({ summary: 'Update user biography' })
  async updateBio(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateBio(req.user.uid, updateUserDto.bio || '');
  }

  @Patch('faculty')
  @ApiOperation({ summary: 'Update user faculty' })
  async updateFaculty(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateFaculty(req.user.uid, {
      facultyId: updateUserDto.facultyId,
    });
  }
}
