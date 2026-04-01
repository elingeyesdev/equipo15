import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @Get()
  findAll() {
    return this.challengesService.findAllPublic();
  }

  @Get('private/:token')
  findPrivate(@Param('token') token: string) {
    return this.challengesService.findPrivateByToken(token);
  }

  @Post('access')
  async grantAccess(@Body() body: { userId: string, challengeId: string }) {
    await this.challengesService.grantAccess(body.userId, body.challengeId);
    return { success: true };
  }
}
