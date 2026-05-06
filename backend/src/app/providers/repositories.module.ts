import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { IdeaRepository } from '../repositories/idea.repository';
import { ChallengeRepository } from '../repositories/challenge.repository';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import { CommentRepository } from '../repositories/comment.repository';

@Module({
  providers: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    EvaluationRepository,
    CommentRepository,
  ],
  exports: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    EvaluationRepository,
    CommentRepository,
  ],
})
export class RepositoriesModule {}
