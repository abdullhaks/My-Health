
import { Request, Response } from "express";
import IDirectDocUploadS3Ctrl from "../interfaces/IDirectDocUploadS3";
import { inject,injectable } from "inversify";
import IDirectDocUploadS3Service from "../../../services/common/interfaces/IDirectDocUploadS3Service";


@injectable()
export default class DirectDocUploadS3Controller implements IDirectDocUploadS3Ctrl {
private _uploadService: IDirectDocUploadS3Service;

  constructor(@inject("IDirectDocUploadS3Service")DirectDocUploadS3Service:IDirectDocUploadS3Service ){
    this._uploadService = DirectDocUploadS3Service
  };


  async directUpload(req: Request, res: Response): Promise<any> {
   try {
      const file = req.file

      console.log("Request headers:", req.headers);
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      };

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: `Unsupported file type: ${file.mimetype}` });
      };

      const location = req.body.location ;
       if (!location) {
        return res.status(400).json({ message: `files upload failed` });
      };

      const uploadResult = await this._uploadService.directUpload(file,location);
      res.status(200).json({
        message: uploadResult.message,
        url: uploadResult.url,
      });
    } catch (error) {
      console.error("Error in direct file upload:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  }

}