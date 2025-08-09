import env from "../env.js";
import { Client, ID, Permission, Storage } from "node-appwrite";
const appWriteClient = new Client();
appWriteClient
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);
const appWriteStorage = new Storage(appWriteClient);
export async function uploadToAppwriteBucket(file) {
    try {
        const response = await appWriteStorage.createFile(env.APPWRITE_BUCKET_ID, ID.unique(), file, [Permission.read("any")]);
        return {
            fileId: response.$id,
            fileName: file.name,
            fileSize: file.size,
            previewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/preview?project=${env.APPWRITE_PROJECT_ID}`,
            viewUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${env.APPWRITE_PROJECT_ID}`,
            downloadUrl: `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${response.$id}/download?project=${env.APPWRITE_PROJECT_ID}`,
        };
    }
    catch (error) {
        return null;
    }
}
