import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class DirectMessage {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ type: String, maxLength: 1000, trim: true })
  text: string;

  @Prop({ type: Boolean, default: false })
  delivered: boolean;

  @Prop({ type: Boolean, default: false })
  seen: boolean;
}

export const DirectMessageSchema = SchemaFactory.createForClass(DirectMessage);
export type DirectMessageDocument = HydratedDocument<DirectMessage>;
