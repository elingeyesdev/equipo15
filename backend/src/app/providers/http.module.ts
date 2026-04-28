import { Module } from '@nestjs/common';
import { ServicesModule } from './services.module';
import { UsersController } from '../http/controllers/users.controller';
import { IdeasController } from '../http/controllers/ideas.controller';
import { ChallengesController } from '../http/controllers/challenges.controller';
import { EvaluationsController } from '../http/controllers/evaluations.controller';
import { CommentsController } from '../http/controllers/comments.controller';

@Module({
  imports: [ServicesModule],
  controllers: [
    UsersController,
    IdeasController,
    ChallengesController,
    EvaluationsController,
    CommentsController,
  ],
})
export class HttpModule {}
