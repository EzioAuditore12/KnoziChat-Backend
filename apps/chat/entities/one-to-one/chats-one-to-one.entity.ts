import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'apps/common/utils/snowflake';
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

  @Prop({ type: String, enum: ['image', 'video', 'text', 'file'] })
  contentType: 'image' | 'video' | 'text' | 'file';

  @Prop({ type: String, default: null })
  content: string | null;

  @Prop({ type: String, default: null })
  attachmentUrl: string | null;

  @Prop({
    type: String,
    enum: ['DELIVERED', 'SEEN'],
    default: 'DELIVERED',
  })
  status: 'DELIVERED' | 'SEEN';

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

ChatsOneToOneSchema.index({ updatedAt: 1 });

export type ChatsOneToOneDocument = HydratedDocument<ChatsOneToOne>;
