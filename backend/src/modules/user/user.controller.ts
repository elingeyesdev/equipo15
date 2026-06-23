import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  Post,
  Put,
  Param,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { UserResponse } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SyncUserDto } from './dtos/sync-user.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { AdminService } from '../admin/admin.service';
import { CreateFacultyDto } from '../admin/dto/create-faculty.dto';
import { UpdateFacultyDto } from '../admin/dto/update-faculty.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  private async assertAdmin(req: AuthenticatedRequest) {
    const profile = await this.userService.findByUid(req.user.uid);
    const role = String(profile?.role ?? profile?.roleName ?? '').toLowerCase();

    if (role !== 'admin') {
      throw new ForbiddenException(
        'Acceso Restringido: Se requiere rol de administrador.',
      );
    }
  }

  private applySessionContext(
    profile: UserResponse | null,
    req: AuthenticatedRequest,
  ): UserResponse | null {
    if (!req.user.impersonationReadOnly) {
      return profile;
    }

    const baseProfile = profile || {
      id: req.user.companyId || 'impersonated-id',
      firebaseUid: req.user.uid,
      email: req.user.email || '',
      displayName: req.user.companyName || 'Organización (Perfil Incompleto)',
      bio: null,
      nickname: null,
      totalPoints: 0,
      phone: null,
      role: 'company',
      roleName: 'company',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserResponse;

    return {
      ...baseProfile,
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
    let profile: UserResponse | null = null;
    
    try {
      profile = await this.userService.findOrCreate(
        {
          firebaseUid: user.uid,
          email: user.email || '',
          displayName:
            (user as { name?: string }).name ||
            (user as { displayName?: string }).displayName ||
            user.email?.split('@')[0] ||
            'Usuario de Pista 8',
        },
        false,
        true,
      );
    } catch (e) {
      if (req.user.impersonationReadOnly && e.status === 404) {
        profile = null;
      } else {
        throw e;
      }
    }

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
    @Body() body: SyncUserDto,
  ) {
    const { user } = req;
    return this.userService.findOrCreate(
      {
        firebaseUid: user.uid,
        email: user.email || '',
        displayName:
          body.displayName ||
          (user as { displayName?: string }).displayName ||
          user.email?.split('@')[0] ||
          'Usuario de Pista 8',
        phone: body.phone,
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
  @ApiOperation({
    summary: 'Get faculties (active for users, full catalog for admin)',
  })
  async getFaculties(@Request() req: AuthenticatedRequest) {
    const profile = await this.userService.findByUid(req.user.uid);
    const isAdmin =
      String(profile?.role ?? profile?.roleName ?? '').toLowerCase() ===
      'admin';
    return this.userService.getAllFaculties(!isAdmin);
  }

  @Post('faculties')
  @ApiOperation({ summary: 'Create faculty (admin)' })
  async createFaculty(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateFacultyDto,
  ) {
    await this.assertAdmin(req);
    return this.adminService.createFaculty(dto);
  }

  @Put('faculties/:id')
  @ApiOperation({ summary: 'Update faculty name (admin)' })
  async updateFacultyCatalog(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
  ) {
    await this.assertAdmin(req);
    return this.adminService.updateFaculty(id, dto);
  }

  @Patch('faculties/:id/status')
  @ApiOperation({ summary: 'Toggle faculty status (admin)' })
  async updateFacultyCatalogStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    await this.assertAdmin(req);
    return this.adminService.updateFacultyStatus(id, body.isActive);
  }

  @Delete('faculties/:id')
  @ApiOperation({ summary: 'Delete faculty (admin)' })
  async removeFacultyCatalog(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.assertAdmin(req);
    return this.adminService.removeFaculty(id);
  }
}
