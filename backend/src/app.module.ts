import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { RolesModule } from './modules/roles/roles.module';
import { FirebaseAdminModule } from './config/firebase-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    FirebaseAdminModule,
    RolesModule,
    UsersModule,
    IdeasModule,
    EvaluationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
