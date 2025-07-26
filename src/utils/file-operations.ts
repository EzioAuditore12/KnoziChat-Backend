import { randomUUID } from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export const defaultFileNameGenerator = (originalname: string): string => {
	const ext = path.extname(originalname);
	const basename = path.basename(originalname, ext);
	return `${basename}-${Date.now()}-${randomUUID()}${ext}`;
};

export const streamFileToDisk = async (
	file: File,
	filePath: string,
): Promise<void> => {
	const fileHandle = await fs.open(filePath, "w");
	const writeStream = fileHandle.createWriteStream();

	try {
		const reader = file.stream().getReader();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			if (!writeStream.write(value)) {
				await new Promise<void>((resolve) =>
					writeStream.once("drain", resolve),
				);
			}
		}

		writeStream.end();
		await new Promise<void>((resolve, reject) => {
			writeStream.on("finish", () => resolve());
			writeStream.on("error", reject);
		});
	} catch (error) {
		writeStream.destroy();
		throw error;
	} finally {
		await fileHandle.close();
	}
};

export const removeFileSync = (filePath: string): void => {
	try {
		fsSync.unlinkSync(filePath);
	} catch (error) {
		console.error(`Failed to remove file: ${filePath}`, error);
	}
};
