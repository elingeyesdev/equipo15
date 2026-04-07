import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EvaluationService } from '../../Services/evaluation.service';
import { CreateEvaluationDto } from '../../DTOs/create-evaluation.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/guards/roles.decorator';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('judge', 'admin')
  async create(@Body() createEvaluationDto: CreateEvaluationDto, @Request() req: any) {
    return this.evaluationService.evaluateIdea({
      ...createEvaluationDto,
      judgeId: req.user.uid,
    });
  }

  @Get('idea/:ideaId')
  @UseGuards(FirebaseAuthGuard)
  async findByIdea(@Param('ideaId') ideaId: string) {
    return this.evaluationService.findByIdea(ideaId);
  }

  @Get('judge/:judgeId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('judge', 'admin')
  async findByJudge(@Param('judgeId') judgeId: string) {
    return this.evaluationService.findByJudge(judgeId);
  }
}
