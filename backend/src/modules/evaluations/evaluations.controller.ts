import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';

@Controller('evaluations')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles('judge', 'admin')
  create(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Get('idea/:ideaId')
  findByIdea(@Param('ideaId') ideaId: string) {
    return this.evaluationsService.findByIdea(ideaId);
  }
}
