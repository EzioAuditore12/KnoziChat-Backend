import {
  Injectable,
  Inject,
  OnModuleInit,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConversationOneToOneService } from 'apps/chat/services/one-to-one/conversation-one-to-one.service';
import { ConversationGroupMemberService } from 'apps/chat/services/group/conversation-group-member.service';

import type { ClientGrpc } from '@nestjs/microservices';

import { AIServiceClient, EmbedMessageRequest } from './generated/ai';
import { ProcessQueryDto } from './dto/process-query.dto';
import { SeedChatsDto } from './dto/seed-chats.dto';

@Injectable()
export class AiService implements OnModuleInit {
  private aiService: AIServiceClient;

  constructor(
    @Inject('AI_PACKAGE')
    private client: ClientGrpc,
    private readonly conversationOneToOneService: ConversationOneToOneService,
    private readonly conversationGroupMemberService: ConversationGroupMemberService,
  ) {}

  public onModuleInit() {
    this.aiService = this.client.getService<AIServiceClient>('AIService');
  }

  public askAI(prompt: string) {
    return this.aiService.askAi({
      prompt,
    });
  }

  public async processQuery(
    processQueryDto: ProcessQueryDto,
    userId: string,
    username: string,
  ) {
    const { conversationId, isGroup, query } = processQueryDto;

    await this.verifyUserMembership(conversationId, userId, isGroup);

    return this.aiService.processQuery({
      query,
      group: {
        groupId: BigInt(conversationId),
        groupName: isGroup ? 'Group Chat' : 'Direct Chat',
      },
      chats: [],
      userId,
      username,
    });
  }

  public embedMessage(data: EmbedMessageRequest) {
    return firstValueFrom(this.aiService.embedMessage(data));
  }

  public seedChats(seedChatsDto: SeedChatsDto) {
    const { conversationId, isGroup, chats } = seedChatsDto;
    return firstValueFrom(
      this.aiService.seedChats({
        conversationId,
        isGroup,
        chats,
      }),
    );
  }

  private async verifyUserMembership(
    conversationId: string,
    userId: string,
    isGroup: boolean,
  ): Promise<void> {
    if (isGroup) {
      const isMember =
        await this.conversationGroupMemberService.isExistingMember(
          BigInt(conversationId),
          userId,
        );
      if (!isMember)
        throw new ForbiddenException(
          'User is not part of this group conversation',
        );
    } else {
      const isMember =
        await this.conversationOneToOneService.isExistingConversationParticipant(
          BigInt(conversationId),
          userId,
        );
      if (!isMember)
        throw new ForbiddenException(
          'User is not part of this direct conversation',
        );
    }
  }
}
