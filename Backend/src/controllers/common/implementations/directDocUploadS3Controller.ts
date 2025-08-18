
import { Request, Response } from "express";
import IDirectDocUploadS3Ctrl from "../interfaces/IDirectDocUploadS3";
import { inject,injectable } from "inversify";
import IDirectDocUploadS3Service from "../../../services/common/interfaces/IDirectDocUploadS3Service";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class DirectDocUploadS3Controller implements IDirectDocUploadS3Ctrl {


  constructor(@inject("IDirectDocUploadS3Service") private _uploadService: IDirectDocUploadS3Service )
  { };


  async directUpload(req: Request, res: Response): Promise<void> {
   try {
      const file = req.file

      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);

      if (!file) {
        //  res.status(HttpStatusCode.BAD_REQUEST).json({ message: "No file uploaded" });
        throw new Error("No file uploaded")
      };

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "video/mp4",
        "video/quicktime",               
        "video/x-msvideo",               
        "video/x-matroska",             
        "video/webm",                    
        "video/mpeg",                    
        "video/3gpp",                  
        "video/ogg"                      
      ];
      if (!allowedTypes.includes(file.mimetype)) {
         res.status(HttpStatusCode.BAD_REQUEST).json({ message: `Unsupported file type: ${file.mimetype}` });
         return;
      };

      const location = req.body.location ;
       if (!location) {
         res.status(HttpStatusCode.BAD_REQUEST).json({ message: `files upload failed` });
         return
      };

      const uploadResult = await this._uploadService.directUpload(file,location);
      res.status(HttpStatusCode.OK).json({
        message: uploadResult.message,
        url: uploadResult.url,
      });
    } catch (error) {
      console.error("Error in direct file upload:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to upload file" });
    }
  }

}