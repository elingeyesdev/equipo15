import { Module } from '@nestjs/common';
import { CommentsController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { UserModule } from '../user/user.module';
import { ModerationModule } from '../moderation/moderation.module';
import { IdeaModule } from '../idea/idea.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UserModule, ModerationModule, IdeaModule, ChallengeModule, NotificationModule],
  controllers: [CommentsController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
