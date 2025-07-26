# Memory Usage Comparison: FormData vs Streaming Multipart

## **OLD APPROACH (hono-multer.ts):**
```
Frontend (27MB file) 
    ↓ 
FormData parsing → 27MB loaded into memory ❌
    ↓ 
streamFileToDisk() → Write to disk (efficient ✅)
    ↓ 
Appwrite chunked upload from disk (efficient ✅)
```

**Memory Peak:** ~27MB+ (entire file in memory)

## **NEW APPROACH (hono-streaming-multer.ts):**
```
Frontend (27MB file)
    ↓ 
Direct streaming parse → Only small chunks in memory ✅
    ↓ 
Write chunks directly to disk ✅
    ↓ 
Appwrite chunked upload from disk ✅
```

**Memory Peak:** ~64KB (only boundary buffer size)

## **Key Differences:**

### Old Method:
```typescript
// ❌ This loads ENTIRE file into memory
const formData = await c.req.formData();

// Then streams to disk
await streamFileToDisk(file, filePath);
```

### New Method:
```typescript
// ✅ This streams directly from request → disk
const { files, fields } = await parseStreamingMultipart(
    c.req.raw,
    dest,
    fileNameConvertor
);
```

## **Benefits of Streaming Approach:**

1. **Memory Efficient**: Never loads full file into memory
2. **Scalable**: Can handle GB-sized files on 1GB RAM server
3. **Better Performance**: No memory allocation spikes
4. **Server Stability**: Prevents OOM errors

## **Complete Flow:**

```
Client uploads 27MB file
    ↓ 
hono-streaming-multer receives request stream
    ↓ 
parseStreamingMultipart processes chunks (64KB at a time)
    ↓ 
Each chunk immediately written to disk
    ↓ 
File uploaded to Appwrite in chunks
    ↓ 
Local file cleaned up
```

**Total Memory Usage:** Always < 1MB regardless of file size!

## **Usage Change:**

Replace this:
```typescript
import { honoMulter } from "@/middlewares/hono-multer";
```

With this:
```typescript
import { honoStreamingMulter } from "@/middlewares/hono-streaming-multer";
```

The API is identical - just change the import and function name!
