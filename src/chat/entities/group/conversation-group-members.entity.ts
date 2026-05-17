import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ConversationGroup } from './conversation-group.entity';
import { HydratedDocument } from 'mongoose';

export const CONVERSATION_GROUP_MEMBER_TABLE_NAME = 'conversation_group_member';

@Schema({ collection: CONVERSATION_GROUP_MEMBER_TABLE_NAME, timestamps: false })
export class ConversationGroupMember {
  @Prop({
    type: String,
    required: true,
  })
  _id: string;

  @Prop({
    type: BigInt,
    ref: ConversationGroup.name,
    required: true,
    index: true,
  })
  groupId: bigint;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  userId: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isAdmin: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  joinedAt: Date;
}

export const ConversationGroupMemberSchema = SchemaFactory.createForClass(
  ConversationGroupMember,
);
export type ConversationGroupMemberDocument =
  HydratedDocument<ConversationGroupMember>;
