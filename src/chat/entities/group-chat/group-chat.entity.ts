import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class GroupChat {
  @Prop({ maxLength: 50, required: true })
  name: string;

  @Prop({
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length >= 1,
      'At least one admin is required',
    ],
  })
  admins: string[];

  @Prop({
    type: [String],
    required: true,
    validate: [
      (val: string[]) => val.length >= 2,
      'At least two members are required',
    ],
  })
  members: string[];

  @Prop({ required: false })
  avatar?: string;
}

export const GroupChatSchema = SchemaFactory.createForClass(GroupChat);
export type GroupChatDocument = HydratedDocument<GroupChat>;
