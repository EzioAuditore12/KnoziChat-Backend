import fs from "node:fs";
import { Client, Storage } from "node-appwrite";
import env from "../env";
// Import the working manual upload as fallback
import { uploadToAppwriteBucketFromPath as manualUpload } from "./appwrite";

const client = new Client()
	.setEndpoint(env.APPWRITE_ENDPOINT)
	.setProject(env.APPWRITE_PROJECT_ID)
	.setKey(env.APPWRITE_API_KEY);

const storage = new Storage(client);

/**
 * Test Appwrite connection and configuration
 */
export async function testAppwriteConnection() {
	try {
		console.log("Testing Appwrite connection...");
		console.log(`Endpoint: ${env.APPWRITE_ENDPOINT}`);
		console.log(`Project ID: ${env.APPWRITE_PROJECT_ID}`);

		// Try to list buckets to test connection
		const buckets = await storage.listBuckets();
		console.log(
			"Appwrite connection successful. Buckets:",
			buckets.buckets.map((b) => b.name),
		);
		return true;
	} catch (error) {
		console.error("Appwrite connection failed:", error);
		return false;
	}
}

/**
 * Upload file to Appwrite bucket using SDK's built-in chunked upload with fallback
 * Tries SDK first, falls back to manual REST API if SDK fails
 */
export async function uploadToAppwriteBucketFromPath(
	filePath: string,
	fileName: string,
	bucketId: string = env.APPWRITE_BUCKET_ID,
) {
	try {
		console.log(`Starting SDK upload of ${fileName}`);
		console.log(`Appwrite endpoint: ${env.APPWRITE_ENDPOINT}`);
		console.log(`Project ID: ${env.APPWRITE_PROJECT_ID}`);
		console.log(`Bucket ID: ${bucketId}`);

		// Generate a unique file ID
		const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`;

		// Read file and create File object
		const fileBuffer = fs.readFileSync(filePath);
		const file = new File([new Uint8Array(fileBuffer)], fileName);
		const fileStats = fs.statSync(filePath);

		console.log(`File size: ${file.size} bytes`);

		// Use SDK's built-in chunked upload with progress tracking
		const result = await storage.createFile(
			bucketId,
			fileId,
			file,
			['read("any")'], // permissions
			(progress) => {
				console.log(
					`Upload progress: ${progress.progress}% (${progress.sizeUploaded} bytes, chunk ${progress.chunksUploaded}/${progress.chunksTotal})`,
				);
			},
		);

		console.log("SDK upload successful:", result.$id);

		// Return the expected format for compatibility
		return {
			fileId: result.$id,
			fileName: result.name,
			fileSize: result.sizeOriginal,
			previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${result.$id}/preview`,
			viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${result.$id}/view`,
			downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${result.$id}/download`,
		};
	} catch (sdkError) {
		console.warn(
			"SDK upload failed, falling back to manual REST API:",
			sdkError,
		);

		try {
			// Fallback to the working manual implementation
			const fileStats = fs.statSync(filePath);
			const mimeType = fileName.endsWith(".png")
				? "image/png"
				: fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
					? "image/jpeg"
					: fileName.endsWith(".gif")
						? "image/gif"
						: "application/octet-stream";

			const manualResult = await manualUpload(
				filePath,
				fileName,
				mimeType,
				fileStats.size,
			);

			if (manualResult) {
				console.log("Manual upload successful:", manualResult);
				return {
					fileId: manualResult,
					fileName: fileName,
					fileSize: fileStats.size,
					previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${manualResult}/preview`,
					viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${manualResult}/view`,
					downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${manualResult}/download`,
				};
			}
		} catch (manualError) {
			console.error("Both SDK and manual upload failed:", manualError);
		}

		throw sdkError;
	}
}

/**
 * Alternative method using Buffer for cases where you already have file data in memory
 */
export async function uploadToAppwriteBucketFromBuffer(
	buffer: Buffer,
	fileName: string,
	bucketId: string = env.APPWRITE_BUCKET_ID,
) {
	try {
		console.log(
			`Starting SDK buffer upload of ${fileName} (${buffer.length} bytes)`,
		);

		// Generate a unique file ID
		const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`;

		// Create File object from buffer
		const file = new File([new Uint8Array(buffer)], fileName);

		// Use SDK's built-in chunked upload
		const result = await storage.createFile(
			bucketId,
			fileId,
			file,
			['read("any")'], // permissions
			(progress) => {
				console.log(
					`Buffer upload progress: ${progress.progress}% (${progress.sizeUploaded} bytes, chunk ${progress.chunksUploaded}/${progress.chunksTotal})`,
				);
			},
		);

		console.log("SDK buffer upload successful:", result.$id);
		return result.$id;
	} catch (error) {
		console.error("SDK buffer upload failed:", error);
		throw error;
	}
}
