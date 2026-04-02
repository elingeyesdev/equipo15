import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  syncProfile(@Body() createUserDto: CreateUserDto) {
    return this.usersService.findOrCreate(createUserDto);
  }

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findByUid(req.user.uid);
    if (!user) throw new NotFoundException('Perfil no encontrado');
    return user;
  }

  @Patch('faculty')
  @UseGuards(FirebaseAuthGuard)
  updateFaculty(@Req() req: any, @Body('facultyId') facultyId: number) {
    return this.usersService.updateFaculty(req.user.uid, facultyId);
  }

  @Patch(':id/role')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }
}
