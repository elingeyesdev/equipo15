import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
import { UserService } from '../user/user.service';

@Controller('evaluations')
export class EvaluationsController {
  constructor(
    private readonly evaluationService: EvaluationService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('judge', 'admin')
  async create(
    @Body() createEvaluationDto: CreateEvaluationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = await this.userService.findByUid(req.user.uid);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.evaluationService.evaluateIdea({
      ...createEvaluationDto,
      judgeId: user.id,
    });
  }

  @Get('idea/:ideaId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('admin', 'company')
  async findByIdea(
    @Param('ideaId') ideaId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.evaluationService.findByIdea(ideaId, req.user.uid);
  }

  @Get('judge/:judgeId')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('judge', 'admin')
  async findByJudge(@Param('judgeId') judgeId: string) {
    return this.evaluationService.findByJudge(judgeId);
  }
}
