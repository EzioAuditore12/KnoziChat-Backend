import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { GroupChat } from './group-chat.entity';

@Schema({ timestamps: true })
export class GroupMessage {
  @Prop({ required: true })
  senderId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: GroupChat.name,
    required: true,
  })
  groupChat: MongooseSchema.Types.ObjectId;

  @Prop({ maxLength: 1000, required: true, trim: true })
  text: string;
}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
export type GroupMessageDocument = HydratedDocument<GroupMessage>;
