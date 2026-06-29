import { Injectable, NotFoundException } from '@nestjs/common';

import { ConversationGroupMemberService } from './group/conversation-group-member.service';
import { ConversationGroupService } from './group/conversation-group.service';

@Injectable()
export class ConversationGroupOrchestratorService {
  constructor(
    private readonly conversationGroupService: ConversationGroupService,

    private readonly conversationGroupMemberService: ConversationGroupMemberService,
  ) {}

  public async leaveConversation(groupId: bigint, userId: string) {
    /**
     * Conversation existence check
     */
    const exists =
      await this.conversationGroupService.isExistingConversation(groupId);

    if (!exists) {
      throw new NotFoundException('No such group exists');
    }

    /**
     * Leave flow
     */
    const result = await this.conversationGroupMemberService.leaveConversation(
      groupId,
      userId,
    );

    /**
     * Active participants
     */
    const participantIds =
      await this.conversationGroupMemberService.getParticipantIds(groupId);

    return {
      ...result,
      participantIds,
    };
  }
}
