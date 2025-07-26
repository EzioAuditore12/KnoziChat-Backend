import fs from "node:fs/promises";
import path from "node:path";
import env from "@/env";
import { uploadToAppwriteBucketFromPath } from "@/services/appwrite";
import {
	defaultFileNameGenerator,
	removeFileSync,
} from "@/utils/file-operations";
import { parseStreamingMultipart } from "@/utils/streaming-multipart";
import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

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

interface HonoStreamingMulterProps {
	dest?: string;
	allowedTypes?: string[];
	maxSize?: number;
	fileNameConvertor?: (originalFileName: string) => string;
	fieldNames?: string[];
	requireAllFields?: boolean;
	uploadToAppwrite?: boolean;
}

/**
 * TRUE STREAMING multipart parser - never loads entire file into memory
 * Streams directly from request → disk → Appwrite chunks
 */
export function honoStreamingMulter({
	dest = "./public/temp",
	allowedTypes = [],
	maxSize = 26 * 1024 * 1024,
	fileNameConvertor = defaultFileNameGenerator,
	fieldNames = [],
	requireAllFields = false,
	uploadToAppwrite = false,
}: HonoStreamingMulterProps): MiddlewareHandler {
	return createMiddleware(async (c, next) => {
		try {
			await fs.mkdir(dest, { recursive: true });

			// Parse multipart data in streaming fashion - NEVER loads full file into memory
			const { files: streamingFiles, fields } = await parseStreamingMultipart(
				c.req.raw,
				dest,
				fileNameConvertor,
			);

			const files: Record<string, UploadedFile> = {};
			const foundFieldNames = new Set<string>();

			// Process each streamed file
			for (const [fieldName, streamingFile] of Object.entries(streamingFiles)) {
				console.log(
					`Processing streamed file: ${fieldName}, type: ${streamingFile.mimeType}, size: ${streamingFile.size}`,
				);

				// Validate field name
				if (fieldNames.length > 0 && !fieldNames.includes(fieldName)) {
					// Clean up the streamed file
					removeFileSync(streamingFile.filePath);
					throw new Error(
						`File field '${fieldName}' not allowed. Allowed fields: ${fieldNames.join(", ")}`,
					);
				}

				// Validate file type
				if (
					allowedTypes.length > 0 &&
					streamingFile.mimeType &&
					!allowedTypes.includes(streamingFile.mimeType)
				) {
					removeFileSync(streamingFile.filePath);
					throw new Error(
						`File type ${streamingFile.mimeType} not allowed. Allowed types: ${allowedTypes.join(", ")}`,
					);
				}

				// Validate file size
				if (streamingFile.size > maxSize) {
					removeFileSync(streamingFile.filePath);
					throw new Error(
						`File size ${streamingFile.size} exceeds limit of ${maxSize} bytes`,
					);
				}

				const uploadedFile: UploadedFile = {
					fieldname: fieldName,
					originalname: streamingFile.originalFileName,
					savedname: streamingFile.fileName,
					mimetype: streamingFile.mimeType || "application/octet-stream",
					size: streamingFile.size,
					destination: dest,
					filename: streamingFile.fileName,
					path: streamingFile.filePath,
				};

				// Upload to Appwrite if enabled (this will read from disk in chunks)
				if (uploadToAppwrite) {
					try {
						const fileId = await uploadToAppwriteBucketFromPath(
							streamingFile.filePath,
							streamingFile.originalFileName,
							streamingFile.mimeType || "application/octet-stream",
							streamingFile.size,
						);

						if (fileId) {
							// Build the Appwrite URLs manually since we now return just the fileId
							uploadedFile.appwrite = {
								fileId: fileId,
								fileName: streamingFile.originalFileName,
								fileSize: streamingFile.size,
								previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/preview?project=${env.APPWRITE_PROJECT_ID}`,
								viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${env.APPWRITE_PROJECT_ID}`,
								downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/download?project=${env.APPWRITE_PROJECT_ID}`,
							};
							console.log(`File uploaded to Appwrite: ${fileId}`);

							// Remove local file after successful Appwrite upload
							removeFileSync(streamingFile.filePath);
							console.log(`Local file removed: ${streamingFile.filePath}`);
						} else {
							console.warn(
								`Failed to upload ${streamingFile.fileName} to Appwrite, keeping local file`,
							);
						}
					} catch (appwriteError) {
						console.error(
							`Appwrite upload failed for ${streamingFile.fileName}:`,
							appwriteError,
						);
						// Keep local file if Appwrite upload fails
					}
				}

				files[fieldName] = uploadedFile;
				foundFieldNames.add(fieldName);
			}

			// Validation checks
			if (requireAllFields && fieldNames.length > 0) {
				const missingFields = fieldNames.filter(
					(fieldName) => !foundFieldNames.has(fieldName),
				);
				if (missingFields.length > 0) {
					// Clean up any uploaded files
					for (const file of Object.values(files)) {
						removeFileSync(file.path);
					}
					throw new Error(
						`Missing required file fields: ${missingFields.join(", ")}`,
					);
				}
			}

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
			console.error("Streaming file upload error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return c.json({ message: errorMessage }, 400);
		}
	});
}
