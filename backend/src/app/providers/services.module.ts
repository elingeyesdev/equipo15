import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories.module';
import { UserService } from '../services/user.service';
import { IdeaService } from '../services/idea.service';
import { ChallengeService } from '../services/challenge.service';
import { EvaluationService } from '../services/evaluation.service';
import { CommentService } from '../services/comment.service';
import { ModerationService } from '../services/moderation.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProjectDetails,
  ProjectDetailsSchema,
} from '../../database/schemas/project-details.schema';

@Module({
  imports: [
    RepositoriesModule,
    MongooseModule.forFeature([
      { name: ProjectDetails.name, schema: ProjectDetailsSchema },
    ]),
  ],
  providers: [
    UserService,
    IdeaService,
    ChallengeService,
    EvaluationService,
    CommentService,
    ModerationService,
  ],
  exports: [
    UserService,
    IdeaService,
    ChallengeService,
    EvaluationService,
    CommentService,
    ModerationService,
  ],
})
export class ServicesModule {}
