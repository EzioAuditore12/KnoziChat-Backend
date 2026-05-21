import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';

export const CONVERSATION_DIRECT_TABLE_NAME = 'conversation_direct';

@Schema({ timestamps: true, collection: CONVERSATION_DIRECT_TABLE_NAME })
export class ConversationOneToOne {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({
    type: [String],
    required: true,
    index: true,
    unique: true,
    validate: [
      (val: string[]) => val.length === 2,
      'Must have exactly 2 participants',
    ],
  })
  participants: string[];

  @Prop({
    type: Map,
    of: Date,
    default: {},
  })
  lastSeenAt: Map<string, Date>;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationOneToOneSchema =
  SchemaFactory.createForClass(ConversationOneToOne);

ConversationOneToOneSchema.index({ updatedAt: 1 });

export type ConversationOneToOneDocument =
  HydratedDocument<ConversationOneToOne>;
