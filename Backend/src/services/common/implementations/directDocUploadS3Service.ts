
import { uploadFileToS3 } from "../../../middlewares/common/uploadS3";
import IDirectDocUploadS3Service from "../interfaces/IDirectDocUploadS3Service";


export default class DirectDocUploadS3Service implements IDirectDocUploadS3Service {

    constructor(
    ){};
    async directUpload(file: any): Promise<any> {
    if (!file) {
      throw new Error("Document is required for upload");
    }

    const fileUrl = await uploadFileToS3(
      file.buffer,
      file.originalname,
      "chatDoc",
      file.mimetype
    );

    if (!fileUrl) {
      throw new Error("Failed to upload document to S3");
    }

    return {
      message: "Document uploaded successfully",
      url: fileUrl,
    };
  }

}