import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories.module';
import { UserService } from '../Services/user.service';
import { IdeaService } from '../Services/idea.service';
import { ChallengeService } from '../Services/challenge.service';
import { EvaluationService } from '../Services/evaluation.service';
import { CommentService } from '../Services/comment.service';
import { ModerationService } from '../Services/moderation.service';
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
  providers: [UserService, IdeaService, ChallengeService, EvaluationService, CommentService, ModerationService],
  exports: [UserService, IdeaService, ChallengeService, EvaluationService, CommentService, ModerationService],
})
export class ServicesModule {}
