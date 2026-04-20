import { Module } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { IdeaRepository } from '../Repositories/idea.repository';
import { ChallengeRepository } from '../Repositories/challenge.repository';
import { RoleRepository } from '../Repositories/role.repository';
import { EvaluationRepository } from '../Repositories/evaluation.repository';
import { CommentRepository } from '../Repositories/comment.repository';

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
