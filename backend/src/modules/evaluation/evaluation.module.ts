import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { EvaluationRepository } from './evaluation.repository';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UserModule, NotificationModule],
  controllers: [EvaluationsController],
  providers: [EvaluationService, EvaluationRepository],
  exports: [EvaluationService, EvaluationRepository],
})
export class EvaluationModule {}
