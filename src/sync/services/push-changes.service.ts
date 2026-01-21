import { Injectable } from '@nestjs/common';

import { DirectChatService } from 'src/chat/services/direct-chat.service';
import {
  ConversationPushRequestChangeDto,
  DirectChatPushRequestChangeDto,
  PushChangesRequestDto,
} from '../dto/push-changes/push-changes-request.dto';
import {
  ChangeResponseDto,
  PushChangesResponseDto,
} from '../dto/push-changes/push-changes-response.dto';
import { ConversationService } from 'src/chat/services/conversation.service';
import { Types } from 'mongoose';

@Injectable()
export class PushChangesService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly directChatService: DirectChatService,
  ) {}

  async pushChanges(
    senderId: string,
    pushChangeRequestDto: PushChangesRequestDto,
  ): Promise<PushChangesResponseDto> {
    const { changes } = pushChangeRequestDto;

    const results: ChangeResponseDto[] = [];
    const conversationIdMap: Record<string, string> = {}; // tempId -> serverId

    // First pass: handle conversations
    for (const change of changes) {
      if (change.tableName === 'conversations') {
        const result = await this.pushConversationChanges(senderId, change);
        results.push(result);
        // Map temp recordId to serverId
        conversationIdMap[change.recordId] = result.serverId;
      }
    }

    // Second pass: handle direct chats
    for (const change of changes) {
      if (change.tableName === 'direct_chats') {
        // Replace temp conversation_id with serverId
        if (conversationIdMap[change.data.conversation_id]) {
          change.data.conversation_id =
            conversationIdMap[change.data.conversation_id];
        }
        const result = await this.pushDirectChatChanges(senderId, change);
        results.push(result);
      }
    }
    return {
      success: true,
      results,
    };
  }

  private async pushConversationChanges(
    senderId: string,
    conversationPushRequestChangeDto: ConversationPushRequestChangeDto,
  ): Promise<ChangeResponseDto> {
    const { data, operation, recordId, tableName } =
      conversationPushRequestChangeDto;

    const { id, created_at, updated_at, user_id } = data;

    //  if (operation === 'CREATE') TODO: Need to add for update and delete
    const { conversation } = await this.conversationService.create(
      senderId,
      user_id,
      new Date(created_at),
      new Date(updated_at),
    );

    return {
      recordId,
      serverId: conversation._id.toHexString(),
      serverUpdatedAt: new Date().getTime(),
    };
  }

  private async pushDirectChatChanges(
    senderId: string,
    directChatPushRequestChangeDto: DirectChatPushRequestChangeDto,
  ): Promise<ChangeResponseDto> {
    const { data, operation, recordId, tableName } =
      directChatPushRequestChangeDto;

    const {
      conversation_id,
      created_at,
      id,
      is_delivered,
      is_seen,
      mode,
      text,
      updated_at,
    } = data;

    const insertedChat = await this.directChatService.insertChat({
      conversationId: new Types.ObjectId(conversation_id),
      delivered: is_delivered,
      seen: is_seen,
      senderId,
      text,
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at),
    });

    return {
      recordId,
      serverId: insertedChat._id.toHexString(),
      serverUpdatedAt: new Date().getTime(),
    };
  }
}
