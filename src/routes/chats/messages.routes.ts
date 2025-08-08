import { HTTPStatusCode, notFoundSchema, unauthorizedRequestSchema } from "@/lib/constants"
import { authMiddleware } from "@/middlewares/auth-middleware"
import { createRoute,z } from "@hono/zod-openapi"
import { jsonContent } from "stoker/openapi/helpers"

const fileSizeLimit=5 * 1024 * 1024

const mediaSchema=z.instanceof(File).refine((file)=>[
    "image/png",
    "image/jpeg",
    "image/jpg"
].includes(file.type),{
    message:"Invalid document file"
})
.refine((file)=>file.size <=fileSizeLimit,{
    message:"File should not exceed more than 5 mb"
} )

const uploadedAttachmentSchema = z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    previewUrl: z.string(),
    viewUrl: z.string(),
    downloadUrl: z.string()
});

const senderSchema = z.object({
    _id: z.string(),
    name: z.string(),
    avatar: z.string().nullable()
});

const messageResponseSchema = z.object({
    message: z.object({
        content: z.string(),
        uploadedAttachments: z.array(uploadedAttachmentSchema),
        sender: senderSchema,
        chat: z.string()
    })
});

export const sendAttachements=createRoute({
	tags:["Chat"],
	method:"post",
	path:"/send-attachment",
    middleware:[authMiddleware],
	request:{
		body:{
			content:{
				"multipart/form-data":{
					schema: z.object({
                        chatId: z.string().uuid(),
                        attachments: z.union([
                            mediaSchema,         
                            z.array(mediaSchema).min(1)  
                        ]).transform(val => Array.isArray(val) ? val : [val])
					})
				}
			}
		}
	},
	responses:{
		[HTTPStatusCode.CREATED]:jsonContent(
           messageResponseSchema,
            "Attachment added successfully"
        ),
        [HTTPStatusCode.NOT_FOUND]:jsonContent(
            notFoundSchema,
            "Given chat id does not exist"
        ),
        [HTTPStatusCode.UNAUTHORIZED]:jsonContent(
            unauthorizedRequestSchema,
            "Given user is not a member of the group"
        )
	}
})

// get messages

export type SendAttachements=typeof sendAttachements

export const AttachmentsRoutes={
    sendAttachements
}