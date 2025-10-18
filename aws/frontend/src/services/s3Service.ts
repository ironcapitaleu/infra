
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Environment variables
const REGION = import.meta.env.VITE_AWS_REGION;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET_KEY;

// Upload a file to S3
export const uploadToS3 = async (
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // Validate required environment variables at runtime
  if (!REGION) {
    throw new Error("VITE_AWS_REGION environment variable is not set.");
  }
  if (!BUCKET_NAME) {
    throw new Error("VITE_S3_BUCKET_NAME environment variable is not set.");
  }
  if (!ACCESS_KEY) {
    throw new Error("VITE_AWS_ACCESS_KEY environment variable is not set.");
  }
  if (!SECRET_KEY) {
    throw new Error("VITE_AWS_SECRET_KEY environment variable is not set.");
  }

  // Initialize the S3 client using bucket credentials
  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    }
  });

  try {
    const key = `${folder}/${Date.now()}-${file.name}`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: file.type,
      },
    });

    // Add progress tracking if provided
    if (onProgress) {
      upload.on("httpUploadProgress", (progress) => {
        const loaded = progress.loaded || 0;
        const total = progress.total || 1;
        const percentComplete = Math.round((loaded / total) * 100);
        onProgress(percentComplete);
      });
    }

    await upload.done();
    
    // Return the S3 object URL
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
