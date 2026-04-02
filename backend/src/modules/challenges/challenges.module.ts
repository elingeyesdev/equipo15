import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { Challenge, ChallengeSchema } from './entities/challenge.schema';
import { ChallengeAccess, ChallengeAccessSchema } from './entities/challenge-access.schema';
import { User, UserSchema } from '../users/entities/user.schema';
import { Idea, IdeaSchema } from '../ideas/entities/idea.schema';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: ChallengeAccess.name, schema: ChallengeAccessSchema },
      { name: User.name, schema: UserSchema },
      { name: Idea.name, schema: IdeaSchema },
    ]),
    UsersModule,
  ],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
