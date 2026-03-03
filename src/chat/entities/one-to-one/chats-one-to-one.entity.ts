import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';

@Schema({ timestamps: true })
export class ChatsOneToOne {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({
    type: BigInt,
    ref: 'ConversationOneToOne',
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

  createdAt: Date;

  updatedAt: Date;
}

export const ChatsOneToOneSchema = SchemaFactory.createForClass(ChatsOneToOne);
export type ChatsOneToOneDocument = HydratedDocument<ChatsOneToOne>;
