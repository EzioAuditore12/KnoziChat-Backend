import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';
import { ConversationGroup } from './conversation-group.entity';

export const CHAT_GROUP_TABLE_NAME = 'chat_group';

@Schema({ timestamps: true, collection: CHAT_GROUP_TABLE_NAME })
export class ChatsGroup {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({
    type: BigInt,
    ref: ConversationGroup.name,
    required: true,
    index: true,
  })
  conversationId: bigint;

  @Prop({ required: true })
  senderId: string;

  @Prop({ type: String, maxLength: 1000, trim: true })
  text: string;

  @Prop({
    type: [String],
    default: [],
    description: 'User IDs who have received the message',
  })
  deliveredTo: string[];

  @Prop({
    type: [String],
    default: [],
    description: 'User IDs who have seen the message',
  })
  seenBy: string[];

  @Prop({
    type: String,
    default: null,
    description: 'ID of the user who deleted the message (sender or admin)',
  })
  deletedBy?: string | null;

  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  deletedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

export const ChatsGroupSchema = SchemaFactory.createForClass(ChatsGroup);
export type ChatsGroupDocument = HydratedDocument<ChatsGroup>;
