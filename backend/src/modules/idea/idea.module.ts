import { Module } from '@nestjs/common';
import { IdeasController } from './idea.controller';
import { IdeaService } from './idea.service';
import { IdeaRepository } from './idea.repository';
import { UserModule } from '../user/user.module';
import { ModerationModule } from '../moderation/moderation.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UserModule, ModerationModule, ChallengeModule, NotificationModule],
  controllers: [IdeasController],
  providers: [IdeaService, IdeaRepository],
  exports: [IdeaService, IdeaRepository],
})
export class IdeaModule {}
