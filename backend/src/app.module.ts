import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { FirebaseAdminModule } from './infrastructure/firebase/firebase-admin.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventsModule } from './infrastructure/events/events.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { HealthController } from './common/controllers/health.controller';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { UserModule } from './modules/user/user.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { ChallengeModule } from './modules/challenge/challenge.module';
import { IdeaModule } from './modules/idea/idea.module';
import { CommentModule } from './modules/comment/comment.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    FirebaseAdminModule,
    EventsModule,
    RedisModule,
    EvaluationModule,
    UserModule,
    ModerationModule,
    ChallengeModule,
    IdeaModule,
    CommentModule,
    AdminModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300,
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
