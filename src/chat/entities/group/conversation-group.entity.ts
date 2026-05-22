import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';

export const CONVERSATION_GROUP_TABLE_NAME = 'conversation_group';

@Schema({ timestamps: true, collection: CONVERSATION_GROUP_TABLE_NAME })
export class ConversationGroup {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({ type: String, maxLength: 50, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  avatar: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationGroupSchema =
  SchemaFactory.createForClass(ConversationGroup);

ConversationGroupSchema.index({ updatedAt: 1 });

export type ConversationGroupDocument = HydratedDocument<ConversationGroup>;
