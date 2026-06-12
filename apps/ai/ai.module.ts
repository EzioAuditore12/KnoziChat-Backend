import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BullModule } from '@nestjs/bullmq';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbedProcessor } from './embed.processor';
import { ChatModule } from 'apps/chat/chat.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AI_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'ai',
          protoPath: 'proto/ai.proto',
          url: 'localhost:50051',
        },
      },
    ]),
    BullModule.registerQueue({ name: 'embed-messages' }),
    ChatModule,
  ],
  controllers: [AiController],
  providers: [AiService, EmbedProcessor],
})
export class AiModule {}
