// Test file showing the difference between manual REST API vs SDK approach

import { uploadToAppwriteBucketFromPath as manualUpload } from "./appwrite";
import { uploadToAppwriteBucketFromPath as sdkUpload } from "./appwrite-sdk";

/**
 * Example showing the difference between approaches:
 *
 * MANUAL REST API APPROACH (your current implementation):
 * - 350+ lines of code
 * - Manual chunk size calculation
 * - Manual FormData creation
 * - Manual Content-Range headers
 * - Custom EntityTooSmall error handling
 * - Custom retry logic
 * - Axios for HTTP requests
 *
 * SDK APPROACH (new simplified version):
 * - ~75 lines of code
 * - Automatic chunking handled by SDK
 * - Automatic header management
 * - Built-in progress tracking
 * - Built-in error handling
 * - Uses SDK's proven chunked upload logic
 */

export async function testBothApproaches(filePath: string, fileName: string) {
	console.log("=== Testing Manual REST API Approach ===");
	try {
		const manualResult = await manualUpload(
			filePath,
			fileName,
			"image/jpeg",
			12345,
		);
		console.log("Manual upload result:", manualResult);
	} catch (error) {
		console.error("Manual upload failed:", error);
	}

	console.log("\n=== Testing SDK Approach ===");
	try {
		const sdkResult = await sdkUpload(filePath, fileName);
		console.log("SDK upload result:", sdkResult);
	} catch (error) {
		console.error("SDK upload failed:", error);
	}
}

/**
 * Benefits of SDK approach:
 *
 * 1. SIMPLICITY: Much less code to maintain
 * 2. RELIABILITY: Uses tested SDK chunking logic
 * 3. MAINTENANCE: Updates come with SDK updates
 * 4. CONSISTENCY: Same behavior across all Appwrite SDKs
 * 5. FEATURES: Built-in progress tracking, error handling
 * 6. MEMORY: SDK handles memory management internally
 *
 * The SDK automatically:
 * - Detects if file needs chunking (> 5MB)
 * - Splits into appropriate chunks
 * - Sets Content-Range headers
 * - Manages x-appwrite-id for subsequent requests
 * - Handles EntityTooSmall errors
 * - Provides progress callbacks
 * - Retries on failures
 */
