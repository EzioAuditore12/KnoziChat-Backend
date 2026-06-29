import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { ConversationGroup } from './conversation-group.entity';

export const CONVERSATION_GROUP_MEMBER_TABLE_NAME = 'conversation_group_member';

@Schema({ collection: CONVERSATION_GROUP_MEMBER_TABLE_NAME, timestamps: true })
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

  createdAt: Date;

  updatedAt: Date;

  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  deletedAt?: Date | null;
}

export const ConversationGroupMemberSchema = SchemaFactory.createForClass(
  ConversationGroupMember,
);

ConversationGroupMemberSchema.index({
  updatedAt: 1,
});

export type ConversationGroupMemberDocument =
  HydratedDocument<ConversationGroupMember>;
