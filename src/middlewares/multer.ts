import { HonoDiskStorage } from "@hono-storage/node-disk";

const storage = new HonoDiskStorage({
	dest: "./uploads",
	filename: (_, file) => `${file.originalname}-${Date.now()}.${file.extension}`,
});

export const attachementsMulter = storage.multiple("files");
