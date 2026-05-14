import { Global, Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventBus } from './event-bus';

@Global()
@Module({
  providers: [EventsGateway, EventBus],
  exports: [EventsGateway, EventBus],
})
export class EventsModule {}
