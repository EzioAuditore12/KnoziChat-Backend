import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationGroupDto,
  convertConversationGroupSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group.dto';
import { CreateConversationGroupDto } from 'src/chat/dto/group/conversation-group/create-conversation.dto';
import {
  ConversationGroup,
  ConversationGroupDocument,
} from 'src/chat/entities/group/conversation-group.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationGroupService {
  constructor(
    @InjectModel(ConversationGroup.name)
    private readonly conversationsGroupModel: Model<ConversationGroupDocument>,
    private readonly userService: UserService,
  ) {}

  public async create(
    creatorId: string,
    createConversationGroupDto: CreateConversationGroupDto,
  ): Promise<ConversationGroupDto> {
    const { name, participants } = createConversationGroupDto;

    const areExistingUsers =
      await this.userService.areExistingUsers(participants);

    if (!areExistingUsers)
      throw new ForbiddenException(
        'Given participants are not registered with us',
      );

    const uniqueParticipants = Array.from(
      new Set([...participants, creatorId]),
    );

    const conversation = await this.conversationsGroupModel.create({
      name,
      participants: uniqueParticipants,
      admins: [creatorId],
    });

    return convertConversationGroupSchemaFromMongoose.parse(conversation);
  }
}
