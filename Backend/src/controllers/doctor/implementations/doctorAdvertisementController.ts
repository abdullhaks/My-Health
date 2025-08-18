import { inject,injectable } from "inversify";
import IDoctorAdvertisementCtrl from "../interfaces/IDoctorAdvertisementCtrl";
import { Request, Response } from "express";
import IDoctorAdvertisementService from "../../../services/doctor/interfaces/IDoctorAdvertisementServices";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class DoctorAdvertisementController implements IDoctorAdvertisementCtrl {

    constructor(
        @inject("IDoctorAdvertisementService") private _doctorAdvertisementService : IDoctorAdvertisementService
    ){};

    async createAdvertisement(req: Request, res: Response): Promise<void> {

        try{
        
        const {title, videoUrl, location,author,authorId,tags} = req.body;

        if(!title|| !videoUrl|| !location||!author||!authorId||!tags){
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            return 
        };

        const add = {title, videoUrl, location,author,authorId,tags}
        const response = await this._doctorAdvertisementService.createAdvertisement(add);
        if(!response){
                res.status(HttpStatusCode.BAD_REQUEST).json({ message: "add posting failed" });
                return;
              }
                res.status(HttpStatusCode.CREATED).json({
                message: "Blog created successfully",
                data: response,
              });

    }catch(err){
        console.log("error in post add",err);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"post advertisement has failed"});
         return
    };
    };


    async getAdds(req: Request, res: Response): Promise<void> {
    
        try{
          const {doctorId,page,limit} = req.query;
        const pageNumber = page ? parseInt(page as string, 10) : 1;
        const limitNumber = limit ? parseInt(limit as string, 10) : 10;
    
        if(!doctorId){
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: "add fetching failed" });
            return;
        }
    
        const response = await this._doctorAdvertisementService.getAdds(doctorId?.toString(),pageNumber,limitNumber);
        if(!response){
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: "add fetching failed" });
            return;
          };
    
          res.status(HttpStatusCode.OK).json({
            message: "Adds fetched successfully",
            data: response,
          });
    
        }catch(err){
    
          console.error("Error fetching adds:", err);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch adds" });
    
        }
    
      
      };

    
}