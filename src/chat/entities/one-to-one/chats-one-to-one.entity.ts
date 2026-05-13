import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';
import { ConversationOneToOne } from './conversation-one-to-one.entity';

export const CHAT_DIRECT_TABLE_NAME = 'chat_direct';

@Schema({ timestamps: true, collection: CHAT_DIRECT_TABLE_NAME })
export class ChatsOneToOne {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({
    type: BigInt,
    ref: ConversationOneToOne.name,
    required: true,
    index: true,
  })
  conversationId: bigint;

  @Prop({ required: true })
  senderId: string;

  @Prop({ type: String, maxLength: 1000, trim: true })
  text: string;

  @Prop({
    type: String,
    enum: ['SENT', 'DELIVERED', 'SEEN'],
    default: 'SENT',
  })
  status: 'SENT' | 'DELIVERED' | 'SEEN';

  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  deletedAt?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

export const ChatsOneToOneSchema = SchemaFactory.createForClass(ChatsOneToOne);
export type ChatsOneToOneDocument = HydratedDocument<ChatsOneToOne>;
