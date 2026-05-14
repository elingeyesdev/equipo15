import { Module } from '@nestjs/common';
import { ChallengesController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './challenge.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ChallengesController],
  providers: [ChallengeService, ChallengeRepository],
  exports: [ChallengeService, ChallengeRepository],
})
export class ChallengeModule {}
