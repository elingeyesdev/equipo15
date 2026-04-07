import { Module } from '@nestjs/common';
import { UserRepository } from '../Repositories/user.repository';
import { IdeaRepository } from '../Repositories/idea.repository';
import { ChallengeRepository } from '../Repositories/challenge.repository';
import { RoleRepository } from '../Repositories/role.repository';
import { EvaluationRepository } from '../Repositories/evaluation.repository';

@Module({
  providers: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    RoleRepository,
    EvaluationRepository,
  ],
  exports: [
    UserRepository,
    IdeaRepository,
    ChallengeRepository,
    RoleRepository,
    EvaluationRepository,
  ],
})
export class RepositoriesModule {}
