import { Injectable } from '@nestjs/common';

import { DirectChatService } from 'src/chat/services/direct-chat.service';
import { UserService } from 'src/user/user.service';
import {
  ConversationPushRequestChangeDto,
  DirectChatPushRequestChangeDto,
  PushChangesRequestDto,
} from '../dto/push-changes/push-changes-request.dto';
import { ChangeResponseDto } from '../dto/push-changes/push-changes-response.dto';

@Injectable()
export class PushChangesService {
  constructor(
    private readonly userService: UserService,
    private readonly directChatService: DirectChatService,
  ) {}

  async pushChanges(pushChangeRequestDto: PushChangesRequestDto) {
    const { changes } = pushChangeRequestDto;
  }

  private async pushConversationChanges(
    conversationPushRequestChangeDto: ConversationPushRequestChangeDto,
  ) {
    const { data, operation, recordId } = conversationPushRequestChangeDto;

    const { id, created_at, updated_at, user_id } = data;
  }

  private async pushDirectChatChanges(
    directChatPushRequestChangeDto: DirectChatPushRequestChangeDto,
  ) {}
}
