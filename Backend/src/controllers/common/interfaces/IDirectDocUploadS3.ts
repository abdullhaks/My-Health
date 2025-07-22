import { Request,Response } from "express";

export default interface IDirectDocUploadS3Ctrl{

    directUpload (req: Request, res: Response):Promise<void> 
    
    
}