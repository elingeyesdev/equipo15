import { Module } from '@nestjs/common';
import { ServicesModule } from './services.module';
import { UsersController } from '../Http/Controllers/users.controller';
import { IdeasController } from '../Http/Controllers/ideas.controller';
import { ChallengesController } from '../Http/Controllers/challenges.controller';
import { EvaluationsController } from '../Http/Controllers/evaluations.controller';
import { CommentsController } from '../Http/Controllers/comments.controller';

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
