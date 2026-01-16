import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation {
  // Store both user IDs here.
  // Index this so you can quickly find "Chat between A and B"
  @Prop({ type: [String], required: true, index: true })
  participants: string[];

  // Optional: Cache the last message here for the "Inbox" preview
  @Prop({ length: 50 })
  lastMessage?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
export type ConversationDocument = HydratedDocument<Conversation>;
