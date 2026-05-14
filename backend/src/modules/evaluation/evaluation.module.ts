import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { EvaluationRepository } from './evaluation.repository';

@Module({
  controllers: [EvaluationsController],
  providers: [EvaluationService, EvaluationRepository],
  exports: [EvaluationService, EvaluationRepository],
})
export class EvaluationModule {}
