import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin', 'company')
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @Get()
  findAll() {
    return this.challengesService.findAllPublic();
  }

  @Get('global-stats')
  getGlobalStats() {
    return this.challengesService.getGlobalStats();
  }

  @Get(':id/stats')
  getChallengeStats(@Param('id') id: string) {
    return this.challengesService.getStats(id);
  }

  @Get('private/:token')
  findPrivate(@Param('token') token: string) {
    return this.challengesService.findPrivateByToken(token);
  }

  @Post('access')
  @UseGuards(FirebaseAuthGuard)
  async grantAccess(@Body() body: { userId: string, challengeId: string }) {
    await this.challengesService.grantAccess(body.userId, body.challengeId);
    return { success: true };
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin', 'company')
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.challengesService.update(id, updateChallengeDto);
  }
}
