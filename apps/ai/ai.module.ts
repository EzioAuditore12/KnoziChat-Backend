import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

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
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
