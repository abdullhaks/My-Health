import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { S3Client, PutObjectCommand ,GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// S3 client config
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});


export const uploadToS3 =
  (folder: string, convertToJpeg = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return next(); // No file to upload

      const { id } = req.params;
      const file = req.file;
      const ext = convertToJpeg ? ".jpeg" : path.extname(file.originalname);
      const contentType = convertToJpeg ? "image/jpeg" : file.mimetype;
      const fileBuffer = convertToJpeg
        ? await sharp(file.buffer).jpeg({ quality: 90 }).toBuffer()
        : file.buffer;

      const fileName = `${folder}/${id}${ext}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await s3Client.send(command);

      req.body.uploadedImageKey = fileName;
      return next();

    } catch (error) {
      console.error("S3 upload error:", error);
      next(error)

    }
  };


  export const getSignedImageURL = async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
  
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hr expiry
  };


  export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, folderName: string, mimetype: string) {
    const uniqueFileName = `${folderName}/${uuidv4()}${path.extname(fileName)}`;
  
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimetype
    };
  
    const command = new PutObjectCommand(params);
  
    await s3Client.send(command);
  
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
  
    return fileUrl;
  }


