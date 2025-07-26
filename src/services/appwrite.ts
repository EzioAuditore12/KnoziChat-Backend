import env from "@/env";
import { Client, ID, Permission, Storage } from "node-appwrite";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createReadStream } from "node:fs";

const appWriteClient = new Client();

appWriteClient
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);

const appWriteStorage = new Storage(appWriteClient);

export async function uploadToAppwriteBucketFromPath(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileSize: number
) {
    // Use chunked upload only (no fallback)
    try {
        return await uploadWithChunks(filePath, originalName, mimeType, fileSize);
    } catch (error) {
        console.error("Chunked upload failed:", error);
        return null;
    }
}

// Chunked upload implementation using Appwrite's chunked upload API
async function uploadWithChunks(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileSize: number
) {
    const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB minimum
    const BASE_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB base chunk size
    
    // Calculate if we need to adjust chunk size to avoid EntityTooSmall
    const totalChunks = Math.ceil(fileSize / BASE_CHUNK_SIZE);
    const lastChunkSize = fileSize % BASE_CHUNK_SIZE;
    
    let CHUNK_SIZE = BASE_CHUNK_SIZE;
    
    // If last chunk is too small and not the only chunk, redistribute
    if (lastChunkSize > 0 && lastChunkSize < MIN_CHUNK_SIZE && totalChunks > 1) {
        // Calculate chunk size that avoids small last chunk
        CHUNK_SIZE = Math.ceil(fileSize / (totalChunks - 1));
        console.log(`Adjusted chunk size from ${BASE_CHUNK_SIZE} to ${CHUNK_SIZE} to avoid EntityTooSmall error`);
    }
    
    const fileStream = createReadStream(filePath, { highWaterMark: CHUNK_SIZE });
    
    // Generate fileId upfront
    const fileId = ID.unique();
    let offset = 0;
    let chunkIndex = 0;
    
    console.log(`Starting chunked upload for ${originalName} (${fileSize} bytes)`);
    console.log(`Using chunk size: ${CHUNK_SIZE} bytes (estimated ${Math.ceil(fileSize / CHUNK_SIZE)} chunks)`);
    console.log('Generated fileId:', fileId);
    
    try {
        for await (const chunk of fileStream) {
            const chunkSize = chunk.length;
            const start = offset;
            const end = offset + chunkSize - 1;
            const contentRange = `bytes ${start}-${end}/${fileSize}`;
            
            console.log(`Uploading chunk ${chunkIndex} (${start}-${end}/${fileSize})`);
            
            // Retry logic for each chunk
            let retries = 3;
            let chunkSuccess = false;
            
            while (retries > 0 && !chunkSuccess) {
                try {
                    // Create FormData for this chunk
                    const formData = new FormData();
                    const chunkBlob = new Blob([new Uint8Array(chunk)], { type: 'application/octet-stream' });
                    formData.append('file', chunkBlob, originalName);
                    formData.append('bucketId', env.APPWRITE_BUCKET_ID);
                    formData.append('fileId', fileId); // Always include fileId
                    
                    // Add permissions only for first chunk
                    if (chunkIndex === 0) {
                        formData.append('permissions[]', 'read("any")');
                    }
                    
                    const headers = {
                        'Content-Range': contentRange,
                        'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
                        'X-Appwrite-Key': env.APPWRITE_API_KEY,
                    };
                    
                    // Upload chunk with timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                    
                    const response = await fetch(
                        `${env.APPWRITE_ENDPOINT}/storage/files`,
                        {
                            method: 'POST',
                            headers,
                            body: formData,
                            signal: controller.signal,
                        }
                    );
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    console.log(`✓ Uploaded chunk ${chunkIndex} (${start}-${end})`);
                    chunkSuccess = true;
                    
                } catch (error) {
                    retries--;
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.warn(`Chunk ${chunkIndex} failed (${retries} retries left):`, errorMessage);
                    
                    if (retries > 0) {
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // 1s, 2s, 3s delays
                    } else {
                        throw new Error(`Chunk ${chunkIndex} failed after 3 retries: ${errorMessage}`);
                    }
                }
            }
            
            offset += chunkSize;
            chunkIndex++;
            
            // Longer delay between chunks to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('✓ Upload complete, fileId:', fileId);
        
        return {
            fileId: fileId,
            fileName: originalName,
            fileSize: fileSize,
            previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/preview?project=${env.APPWRITE_PROJECT_ID}`,
            viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${env.APPWRITE_PROJECT_ID}`,
            downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}/download?project=${env.APPWRITE_PROJECT_ID}`,
        };
        
    } catch (error) {
        console.error('Chunked upload failed:', error);
        
        // Try to cleanup partial upload
        try {
            await fetch(
                `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${fileId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
                        'X-Appwrite-Key': env.APPWRITE_API_KEY,
                    }
                }
            );
        } catch (cleanupError) {
            console.warn('Failed to cleanup partial upload:', cleanupError);
        }
        
        throw error;
    }
}

// REST API streaming upload (memory efficient)
async function uploadWithRestApi(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileSize: number
) {
    // TRUE STREAMING using Appwrite REST API - NO MEMORY LOADING
    const fileId = ID.unique();
    
    // Create multipart boundary
    const boundary = `----formdata-${Date.now()}`;
    
    // Build multipart headers manually
    const headers = {
        'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': env.APPWRITE_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
    };

    // Create the multipart body using streams
    const body = await createStreamingMultipartBody(
        boundary,
        fileId,
        filePath,
        originalName,
        mimeType
    );

    // Make streaming request to Appwrite REST API (try to bypass Varnish)
    const response = await fetch(
        `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files`,
        {
            method: 'POST',
            headers: {
                ...headers,
                // Try to bypass cache
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            body,
            // @ts-ignore - Node.js fetch supports streams
            duplex: 'half',
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Appwrite REST API upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return {
        fileId: result.$id,
        fileName: originalName,
        fileSize: fileSize,
        previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${result.$id}/preview?project=${env.APPWRITE_PROJECT_ID}`,
        viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${result.$id}/view?project=${env.APPWRITE_PROJECT_ID}`,
        downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${result.$id}/download?project=${env.APPWRITE_PROJECT_ID}`,
    };
}

// SDK upload (fallback - uses more memory)
async function uploadWithSdk(
    filePath: string,
    originalName: string,
    mimeType: string,
    fileSize: number
) {
    // Read file into memory for SDK (not ideal but might bypass Varnish)
    const fileBuffer = await fs.promises.readFile(filePath);
    const file = new File([new Uint8Array(fileBuffer)], originalName, { type: mimeType });

    const response = await appWriteStorage.createFile(
        env.APPWRITE_BUCKET_ID,
        ID.unique(),
        file,
        [Permission.read("any")], // Ensure public read access
    );

    return {
        fileId: response.$id,
        fileName: originalName,
        fileSize: fileSize,
        previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/preview?project=${env.APPWRITE_PROJECT_ID}`,
        viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${env.APPWRITE_PROJECT_ID}`,
        downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/download?project=${env.APPWRITE_PROJECT_ID}`,
    };
}

// Create streaming multipart body without loading file into memory
async function createStreamingMultipartBody(
    boundary: string,
    fileId: string,
    filePath: string,
    originalName: string,
    mimeType: string
): Promise<ReadableStream> {
    const encoder = new TextEncoder();
    
    return new ReadableStream({
        async start(controller) {
            try {
                // Add fileId field
                controller.enqueue(encoder.encode(`--${boundary}\r\n`));
                controller.enqueue(encoder.encode(`Content-Disposition: form-data; name="fileId"\r\n\r\n`));
                controller.enqueue(encoder.encode(`${fileId}\r\n`));
                
                // Add permissions field
                controller.enqueue(encoder.encode(`--${boundary}\r\n`));
                controller.enqueue(encoder.encode(`Content-Disposition: form-data; name="permissions[]"\r\n\r\n`));
                controller.enqueue(encoder.encode(`read("any")\r\n`));
                
                // Add file field header
                controller.enqueue(encoder.encode(`--${boundary}\r\n`));
                controller.enqueue(encoder.encode(`Content-Disposition: form-data; name="file"; filename="${originalName}"\r\n`));
                controller.enqueue(encoder.encode(`Content-Type: ${mimeType}\r\n\r\n`));
                
                // Stream file content directly (NO MEMORY LOADING!)
                const fileStream = createReadStream(filePath, { highWaterMark: 1024 * 1024 }); // 64KB chunks
                
                for await (const chunk of fileStream) {
                    controller.enqueue(new Uint8Array(chunk));
                }
                
                // Add closing boundary
                controller.enqueue(encoder.encode(`\r\n--${boundary}--\r\n`));
                
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}

// Keep the original function for backward compatibility
export async function uploadToAppwriteBucket(file: File) {
    try {
        const response = await appWriteStorage.createFile(
            env.APPWRITE_BUCKET_ID,
            ID.unique(),
            file,
            [Permission.read("any")], // for default enabled for all for now
        );

        return {
            fileId: response.$id,
            fileName: file.name,
            fileSize: file.size,
            previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/preview?project=${env.APPWRITE_PROJECT_ID}`,
            viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${env.APPWRITE_PROJECT_ID}`,
            downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/download?project=${env.APPWRITE_PROJECT_ID}`,
        };
    } catch (error) {
        console.error("Appwrite upload error:", error);
        return null;
    }
}
