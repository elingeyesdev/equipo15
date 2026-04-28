import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { IdeaRepository } from '../repositories/idea.repository';
import { ChallengeRepository } from '../repositories/challenge.repository';
import { RoleRepository } from '../repositories/role.repository';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import { CommentRepository } from '../repositories/comment.repository';

@Module({
  providers: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    RoleRepository,
    EvaluationRepository,
    CommentRepository,
  ],
  exports: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    RoleRepository,
    EvaluationRepository,
    CommentRepository,
  ],
})
export class RepositoriesModule {}
