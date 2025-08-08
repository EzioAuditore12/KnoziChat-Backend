ALTER TABLE "message" RENAME COLUMN "sender" TO "senderId";--> statement-breakpoint
ALTER TABLE "message" RENAME COLUMN "chat" TO "chatId";--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_sender_users_id_fk";
--> statement-breakpoint
ALTER TABLE "message" DROP CONSTRAINT "message_chat_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;