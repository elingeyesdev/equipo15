import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { ChallengesModule } from './modules/challenges/challenges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    IdeasModule,
    EvaluationsModule,
    ChallengesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
