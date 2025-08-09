import { randomFillSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const randomHex = (() => {
    const buf = Buffer.alloc(16);
    return () => randomFillSync(buf).toString("hex");
})();
export function singleFile({ fieldName, maxSize, allowedType, }) {
    return (bb, uploadDir = "./public/temp") => {
        return new Promise((resolve) => {
            let uploadedFile = null;
            let fileProcessed = false;
            let currentFileSize = 0;
            bb.on("file", (currentFieldName, fileStream, info) => {
                // Check if this is the field we're looking for
                if (currentFieldName !== fieldName) {
                    fileStream.resume(); // Consume the stream
                    return;
                }
                // Check if we already processed a file for this field
                if (fileProcessed) {
                    fileStream.resume();
                    return resolve({
                        success: false,
                        error: `Only one file allowed for field '${fieldName}'`,
                    });
                }
                const { filename, mimeType } = info;
                // Validate file type
                if (!allowedType.includes(mimeType)) {
                    fileStream.resume();
                    return resolve({
                        success: false,
                        error: `File type '${mimeType}' not allowed. Allowed types: ${allowedType.join(", ")}`,
                    });
                }
                console.log(`Processing file [${currentFieldName}]: ${filename}, type: ${mimeType}`);
                // Create upload directory if it doesn't exist
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const saveTo = path.join(uploadDir, `${randomHex()}-${filename}`);
                const writer = fs.createWriteStream(saveTo);
                fileProcessed = true;
                // Track file size during upload
                fileStream.on("data", (chunk) => {
                    currentFileSize += chunk.length;
                    // Check size limit
                    if (currentFileSize > maxSize) {
                        fileStream.pause();
                        writer.destroy();
                        // Clean up partial file
                        fs.unlink(saveTo, () => { });
                        return resolve({
                            success: false,
                            error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
                        });
                    }
                });
                fileStream.pipe(writer);
                fileStream.on("end", () => {
                    uploadedFile = {
                        fieldName: currentFieldName,
                        filename,
                        savePath: saveTo,
                        size: currentFileSize,
                        mimeType,
                    };
                    console.log(`File saved: ${saveTo}`);
                });
                fileStream.on("error", (err) => {
                    writer.destroy();
                    fs.unlink(saveTo, () => { });
                    resolve({
                        success: false,
                        error: `File stream error: ${err.message}`,
                    });
                });
                writer.on("error", (err) => {
                    fs.unlink(saveTo, () => { });
                    resolve({ success: false, error: `Write error: ${err.message}` });
                });
            });
            bb.on("close", () => {
                if (!fileProcessed) {
                    resolve({
                        success: false,
                        error: `No file found for field '${fieldName}'`,
                    });
                }
                else if (uploadedFile) {
                    resolve({ success: true, file: uploadedFile });
                }
                else {
                    resolve({ success: false, error: "File processing failed" });
                }
            });
        });
    };
}
