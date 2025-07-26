import { z } from "@hono/zod-openapi";

export const updateProfileRequestBody = z
	.object({
		name: z.string(),
		photo: z
			.instanceof(File)
			.refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
				message: "Only PNG and JPEG files are allowed",
			}),
	})
	.strict();

export const updateProfilePhotoResponse = z.object({
	status: z.boolean(),
	profileUrl: z.string().url(),
	message: z.string(),
});
