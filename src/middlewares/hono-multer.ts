import fs from "node:fs/promises";
import path from "node:path";
import { uploadToAppwriteBucket } from "@/services/appwrite";
import {
	defaultFileNameGenerator,
	removeFileSync,
	streamFileToDisk,
} from "@/utils/file-operations";
import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

//TODO : Need to make this more robust

export interface UploadedFile {
	fieldname: string;
	originalname: string;
	savedname: string;
	mimetype: string;
	size: number;
	destination: string;
	filename: string;
	path: string;
	// Appwrite storage URLs
	appwrite?: {
		fileId: string;
		fileName: string;
		fileSize: number;
		previewUrl: string;
		viewUrl: string;
		downloadUrl: string;
	};
}

interface HonoMulterProps {
	dest?: string;
	allowedTypes?: string[];
	maxSize?: number;
	fileNameConvertor?: (originalFileName: string) => string;
	fieldNames?: string[];
	requireAllFields?: boolean;
	uploadToAppwrite?: boolean;
}

export function honoMulter({
	dest = "./public/temp",
	allowedTypes = [],
	maxSize = 5 * 1024 * 1024,
	fileNameConvertor = defaultFileNameGenerator,
	fieldNames = [],
	requireAllFields = false,
	uploadToAppwrite = false,
}: HonoMulterProps): MiddlewareHandler {
	return createMiddleware(async (c, next) => {
		try {
			await fs.mkdir(dest, { recursive: true });

			const formData = await c.req.formData();

			const files: Record<string, UploadedFile> = {};
			const fields: Record<string, string> = {};
			const foundFieldNames = new Set<string>();

			for (const [name, value] of formData.entries()) {
				if (
					typeof value === "object" &&
					value !== null &&
					"name" in value &&
					"type" in value &&
					"size" in value
				) {
					// It's a file
					const file = value as File;

					if (fieldNames.length > 0 && !fieldNames.includes(name)) {
						throw new Error(
							`File field '${name}' not allowed. Allowed fields: ${fieldNames.join(", ")}`,
						);
					}

					console.log(
						`Processing file: ${name}, type: ${file.type}, size: ${file.size}`,
					);

					if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
						throw new Error(
							`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(", ")}`,
						);
					}

					if (file.size > maxSize) {
						throw new Error(
							`File size ${file.size} exceeds limit of ${maxSize} bytes`,
						);
					}

					const savedFilename = fileNameConvertor(file.name);
					const filePath = path.join(dest, savedFilename);

					await streamFileToDisk(file, filePath);

					const uploadedFile: UploadedFile = {
						fieldname: name,
						originalname: file.name,
						savedname: savedFilename,
						mimetype: file.type,
						size: file.size,
						destination: dest,
						filename: savedFilename,
						path: filePath,
					};

					// Upload to Appwrite if enabled
					if (uploadToAppwrite) {
						try {
							// Create a File object from the saved file for Appwrite upload
							const fileBuffer = await fs.readFile(filePath);
							const appwriteFile = new File(
								[new Uint8Array(fileBuffer)],
								file.name,
								{ type: file.type },
							);

							const appwriteResult = await uploadToAppwriteBucket(appwriteFile);

							if (appwriteResult) {
								uploadedFile.appwrite = appwriteResult;
								console.log(
									`File uploaded to Appwrite: ${appwriteResult.fileId}`,
								);

								// Remove local file after successful Appwrite upload
								removeFileSync(filePath);
								console.log(`Local file removed: ${filePath}`);
							} else {
								console.warn(
									`Failed to upload ${file.name} to Appwrite, keeping local file`,
								);
							}
						} catch (appwriteError) {
							console.error(
								`Appwrite upload failed for ${file.name}:`,
								appwriteError,
							);
							// Keep local file if Appwrite upload fails
						}
					}

					files[name] = uploadedFile;

					foundFieldNames.add(name);
				} else {
					// It's a regular field
					fields[name] = value.toString();
				}
			}

			// Check if all required field names have files (if requireAllFields is true)
			if (requireAllFields && fieldNames.length > 0) {
				const missingFields = fieldNames.filter(
					(fieldName) => !foundFieldNames.has(fieldName),
				);
				if (missingFields.length > 0) {
					throw new Error(
						`Missing required file fields: ${missingFields.join(", ")}`,
					);
				}
			}

			// Check if at least one file was uploaded (when fieldNames are specified)
			if (fieldNames.length > 0 && foundFieldNames.size === 0) {
				throw new Error(
					`No files uploaded. Expected fields: ${fieldNames.join(", ")}`,
				);
			}

			// Set parsed data in context
			c.set("uploadedFiles", files);
			c.set("uploadedFields", fields);

			await next();
		} catch (error) {
			console.error("File upload error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return c.json({ message: errorMessage }, 400);
		}
	});
}
