import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { SendAttachements} from "@/routes/chats/messages.routes";
import { and, eq } from "drizzle-orm";
import { uploadToAppwriteBucket } from "@/providers/appwrite";
import { messageTable } from "@/db/models/messages.model";
import { usersTable } from "@/db/models/users.model";
import { emitEvent } from "@/utils/socket-io";
import { NEW_ATTACHMENT } from "@/constants/events";

export const sendAttachements:AuthenticatedAppRouteHandler<SendAttachements>=async(c)=>{
    
    const senderId=c.get("userId")

    const {chatId,attachments}=c.req.valid("form")

    const [chat]=await db.select().from(chatsTable).where(eq(chatsTable.id,chatId))

    if(!chat){
        return c.json({message:"Not chat ID found"},HTTPStatusCode.NOT_FOUND)
    }

    const [member] = await db
  .select({
    id: usersTable.id,
    name: usersTable.firstName,
    avatar: usersTable.profilePicture
  })
  .from(chatMembersTable)
  .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
  .where(
    and(
      eq(chatMembersTable.chatId, chatId),
      eq(chatMembersTable.userId, senderId)
    )
  );

  const chatMembers = await db
  .select({
    id: usersTable.id,
    name: usersTable.firstName,
    avatar: usersTable.profilePicture
  })
  .from(chatMembersTable)
  .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
  .where(eq(chatMembersTable.chatId, chatId));



    if(!member){
        return c.json({message:"Given sender Id is not a member of this chat"},HTTPStatusCode.UNAUTHORIZED)
    }

    const uploadedAttachments = [];
    for (const file of attachments) {
        const result = await uploadToAppwriteBucket(file);
        if (result) {
            uploadedAttachments.push({
                fileId: result.fileId,
                fileName: result.fileName,
                fileSize: result.fileSize,
                previewUrl: result.previewUrl, 
                viewUrl: result.viewUrl ,      
                downloadUrl: result.downloadUrl 
            });
        }
    }

    const messageForRealTime={
        content:"",
        uploadedAttachments,
        sender:{
            _id:member.id,
            name:member.name,
            avatar:member.avatar
        },
        chat:chat.id
    }
    
    await db.insert(messageTable).values({
        senderId:senderId,
        chatId:chatId,
        attachements:uploadedAttachments
    })

    emitEvent(c,NEW_ATTACHMENT,chatMembers.map(member => member.id),{
        message:messageForRealTime,
        chatId:chat.id
    })

    return c.json({
        message:messageForRealTime
    },HTTPStatusCode.CREATED)
    
}