import { Controller, Get, Body, Patch, Param, UseGuards, Request, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../../Services/user.service';
import { CreateUserDto } from '../../DTOs/create-user.dto';
import { UpdateUserDto } from '../../DTOs/update-user.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authorized user' })
  async getMe(@Request() req: any) {
    return this.userService.findOrCreate({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name || req.user.displayName || req.user.email?.split('@')[0] || 'Usuario de Pista 8',
      avatarUrl: req.user.picture || req.user.photoURL,
    });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current profile' })
  async getProfile(@Request() req: any) {
    return this.getMe(req);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Force sync user profile with Firebase' })
  async syncUser(@Request() req: any, @Body() body: any) {
    return this.userService.findOrCreate({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: body.displayName || req.user.name || req.user.email?.split('@')[0] || 'Usuario de Pista 8',
      avatarUrl: body.avatarUrl || req.user.picture || req.user.photoURL,
    }, true); // Pass true to force update/sync
  }

  @Patch('bio')
  @ApiOperation({ summary: 'Update user biography' })
  async updateBio(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateBio(req.user.uid, updateUserDto.bio || '');
  }

  @Patch('faculty')
  @ApiOperation({ summary: 'Update user faculty' })
  async updateFaculty(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateFaculty(req.user.uid, { facultyId: updateUserDto.facultyId });
  }
}
