import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DirectChat {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ type: String, maxLength: 1000, trim: true })
  text: string;

  @Prop({ type: Boolean, default: false })
  delivered: boolean;

  @Prop({ type: Boolean, default: false })
  seen: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const DirectChatSchema = SchemaFactory.createForClass(DirectChat);
export type DirectChatDocument = HydratedDocument<DirectChat>;
