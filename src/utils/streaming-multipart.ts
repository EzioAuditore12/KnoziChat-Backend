import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

interface StreamingFile {
	fieldName: string;
	fileName: string;
	originalFileName: string;
	mimeType: string;
	filePath: string;
	size: number;
}

interface StreamingFields {
	[key: string]: string;
}

interface StreamingMultipartResult {
	files: Record<string, StreamingFile>;
	fields: StreamingFields;
}

/**
 * Parse multipart form data in a streaming fashion without loading entire file into memory
 * This directly streams from the request to disk
 */
export async function parseStreamingMultipart(
	request: Request,
	destDir: string,
	fileNameGenerator: (originalName: string) => string,
): Promise<StreamingMultipartResult> {
	const contentType = request.headers.get("content-type");
	if (!contentType || !contentType.includes("multipart/form-data")) {
		throw new Error("Request is not multipart/form-data");
	}

	// Extract boundary from content-type header
	const boundaryMatch = contentType.match(/boundary=(.+)$/);
	if (!boundaryMatch) {
		throw new Error("No boundary found in content-type");
	}
	const boundary = `--${boundaryMatch[1]}`;
	const endBoundary = `${boundary}--`;

	// Ensure destination directory exists
	await fs.mkdir(destDir, { recursive: true });

	const files: Record<string, StreamingFile> = {};
	const fields: StreamingFields = {};

	if (!request.body) {
		throw new Error("Request body is null");
	}

	const reader = request.body.getReader();
	let buffer = new Uint8Array(0);
	let currentPart: {
		headers: Record<string, string>;
		fieldName: string;
		fileName?: string;
		originalFileName?: string;
		mimeType?: string;
		fileHandle?: fs.FileHandle;
		filePath?: string;
		size: number;
	} | null = null;

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (value) {
				// Append new data to buffer
				const newBuffer = new Uint8Array(buffer.length + value.length);
				newBuffer.set(buffer);
				newBuffer.set(value, buffer.length);
				buffer = newBuffer;
			}

			// Process complete boundaries in buffer
			while (true) {
				const bufferString = new TextDecoder().decode(buffer);
				const boundaryIndex = bufferString.indexOf(boundary);

				if (boundaryIndex === -1) {
					// No complete boundary found
					if (currentPart?.fileHandle) {
						// If we're in the middle of a file, write the buffer (keeping some for potential boundary)
						const writeSize = Math.max(0, buffer.length - boundary.length * 2);
						if (writeSize > 0) {
							await currentPart.fileHandle.write(buffer.slice(0, writeSize));
							currentPart.size += writeSize;
							buffer = buffer.slice(writeSize);
						}
					}
					break;
				}

				// Found boundary - process the part before it
				const partData = buffer.slice(0, boundaryIndex);

				if (currentPart) {
					if (currentPart.fileHandle) {
						// Write remaining file data
						if (partData.length > 0) {
							await currentPart.fileHandle.write(partData);
							currentPart.size += partData.length;
						}
						await currentPart.fileHandle.close();

						// Add completed file to results
						files[currentPart.fieldName] = {
							fieldName: currentPart.fieldName,
							fileName: currentPart.fileName!,
							originalFileName: currentPart.originalFileName!,
							mimeType: currentPart.mimeType!,
							filePath: currentPart.filePath!,
							size: currentPart.size,
						};
					} else {
						// It's a regular field
						const fieldValue = new TextDecoder().decode(partData).trim();
						fields[currentPart.fieldName] = fieldValue;
					}
				}

				// Move buffer past the boundary
				buffer = buffer.slice(boundaryIndex + boundary.length);

				// Check if this is the end boundary
				if (bufferString.slice(boundaryIndex).startsWith(endBoundary)) {
					return { files, fields };
				}

				// Parse headers for next part
				const headerEndIndex = bufferString.indexOf("\r\n\r\n");
				if (headerEndIndex === -1) {
					// Headers not complete yet
					break;
				}

				const headerString = bufferString.slice(0, headerEndIndex);
				const headers = parseHeaders(headerString);

				// Extract field information
				const disposition = headers["content-disposition"] || "";
				const fieldNameMatch = disposition.match(/name="([^"]+)"/);
				const fileNameMatch = disposition.match(/filename="([^"]+)"/);

				if (!fieldNameMatch) {
					throw new Error("No field name found in Content-Disposition");
				}

				const fieldName = fieldNameMatch[1];
				const fileName = fileNameMatch?.[1];

				// Get MIME type from Content-Type header, or detect from filename
				let mimeType = headers["content-type"];

				// If no Content-Type header or it's generic, try to detect from filename
				if (!mimeType || mimeType === "application/octet-stream") {
					if (fileName) {
						mimeType = detectMimeTypeFromFilename(fileName);
					}
				}

				console.log(
					`Parsed part: field=${fieldName}, filename=${fileName}, mimeType=${mimeType}`,
				);
				console.log("Headers:", headers);

				// Move buffer past headers
				buffer = buffer.slice(headerEndIndex + 4); // +4 for \r\n\r\n

				if (fileName) {
					// It's a file - open file handle for streaming
					const savedFileName = fileNameGenerator(fileName);
					const filePath = path.join(destDir, savedFileName);
					const fileHandle = await fs.open(filePath, "w");

					currentPart = {
						headers,
						fieldName,
						fileName: savedFileName,
						originalFileName: fileName,
						mimeType,
						fileHandle,
						filePath,
						size: 0,
					};
				} else {
					// It's a regular field
					currentPart = {
						headers,
						fieldName,
						size: 0,
					};
				}
			}

			if (done) {
				break;
			}
		}

		return { files, fields };
	} finally {
		// Cleanup any open file handles
		if (currentPart?.fileHandle) {
			await currentPart.fileHandle.close();
		}
		reader.releaseLock();
	}
}

function parseHeaders(headerString: string): Record<string, string> {
	const headers: Record<string, string> = {};
	const lines = headerString.split("\r\n").filter((line) => line.trim());

	for (const line of lines) {
		const colonIndex = line.indexOf(":");
		if (colonIndex !== -1) {
			const key = line.slice(0, colonIndex).trim().toLowerCase();
			const value = line.slice(colonIndex + 1).trim();
			headers[key] = value;
		}
	}

	return headers;
}

/**
 * Detect MIME type from filename extension
 */
function detectMimeTypeFromFilename(filename: string): string {
	const ext = filename.toLowerCase().split(".").pop();

	const mimeTypes: Record<string, string> = {
		// Images
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		bmp: "image/bmp",
		ico: "image/x-icon",

		// Videos
		mp4: "video/mp4",
		avi: "video/x-msvideo",
		mov: "video/quicktime",
		wmv: "video/x-ms-wmv",
		flv: "video/x-flv",
		webm: "video/webm",
		mkv: "video/x-matroska",
		"3gp": "video/3gpp",

		// Audio
		mp3: "audio/mpeg",
		wav: "audio/wav",
		ogg: "audio/ogg",
		aac: "audio/aac",
		flac: "audio/flac",

		// Documents
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

		// Archives
		zip: "application/zip",
		rar: "application/vnd.rar",
		"7z": "application/x-7z-compressed",
		tar: "application/x-tar",
		gz: "application/gzip",

		// Text
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		json: "application/json",
		xml: "application/xml",
		csv: "text/csv",
	};

	return ext
		? mimeTypes[ext] || "application/octet-stream"
		: "application/octet-stream";
}
