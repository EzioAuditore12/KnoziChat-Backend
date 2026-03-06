import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { SnowFlakeId } from 'src/common/utils/snowflake';

@Schema({ timestamps: true })
export class ConversationGroup {
  @Prop({
    type: BigInt,
    required: true,
    default: () => new SnowFlakeId(1).generate(),
  })
  _id: bigint;

  @Prop({ type: String, maxLength: 50, trim: true })
  name: string;

  @Prop({
    type: [String],
    required: true,
    index: true,
  })
  admins: string[];

  @Prop({ type: String, required: false, default: null })
  avatar: string | null;

  @Prop({
    type: [String],
    required: true,
    index: true,
    validate: [
      (val: string[]) => val.length >= 2,
      'Must have more than 2 participants',
    ],
  })
  participants: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationGroupSchema =
  SchemaFactory.createForClass(ConversationGroup);

export type ConversationGroupDocument = HydratedDocument<ConversationGroup>;
