import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SnowFlakeId } from 'apps/common/utils/snowflake';
import { HydratedDocument } from 'mongoose';

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
    type: String,
    required: true,
  })
  participant1: string;

  @Prop({
    type: String,
    required: true,
  })
  participant2: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  participantsKey: string;

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
