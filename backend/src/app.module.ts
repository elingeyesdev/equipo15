import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './app/Providers/http.module';
import { DatabaseModule } from './app/Providers/database.module';
import { FirebaseAdminModule } from './config/firebase-admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventsGateway } from './app/Gateways/events.gateway';
import { HealthController } from './app/Http/Controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    DatabaseModule,
    FirebaseAdminModule,
    HttpModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 300, 
    }]),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/pista8'),
  ],
  controllers: [HealthController],
  providers: [
    EventsGateway,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
