import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { FirebaseAdminModule } from './infrastructure/firebase/firebase-admin.module';
import { MongooseModule } from '@nestjs/mongoose';
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
    }),
    DatabaseModule,
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/pista8',
      }),
    }),
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
