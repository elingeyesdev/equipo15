import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengesController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './challenge.repository';
import { UserModule } from '../user/user.module';
import {
  ProjectDetails,
  ProjectDetailsSchema,
} from '../../database/schemas/project-details.schema';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      { name: ProjectDetails.name, schema: ProjectDetailsSchema },
    ]),
  ],
  controllers: [ChallengesController],
  providers: [ChallengeService, ChallengeRepository],
  exports: [ChallengeService, ChallengeRepository],
})
export class ChallengeModule {}
