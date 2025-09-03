import {inject,injectable} from "inversify"
import IUserPrescriptionService from "../../../services/user/interfaces/IUserPrescriptionService";
import IUserPrescriptionCtrl from "../interfaces/IUserPrescriptionCtrl";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";



@injectable()
export default class UserPrescriptionController implements IUserPrescriptionCtrl {

    constructor (
        @inject("IUserPrescriptionService") private _prescriptionService : IUserPrescriptionService
    ){}

    

    async getPrescription(req: Request, res: Response):Promise<void> {

        try{

            const {appointmentId} = req.query

            console.log("appointmentId is.....",appointmentId);
            
            if(appointmentId){
                 const response =await this._prescriptionService.getPrescription(appointmentId.toString());
            if(!response){
                res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
                return
            }
            res.status(HttpStatusCode.OK).json(response);
            return

            }
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            return

        }catch(error){
            console.log("error in get prescriptions",error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get prescriptions failed"});
            return
        }

        
        
    };


    async getLatestPrescription(req: Request, res: Response):Promise<void> {

        try{

            const {userId} = req.query;
            
            if(userId){
                 const response =await this._prescriptionService.getLatestPrescription(userId.toString());
            // if(!response){
            //     res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            //     return
            // }
            res.status(HttpStatusCode.OK).json(response);
            return

            }
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            return

        }catch(error){
            console.log("error in get latest prescription",error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get latest prescription failed"});
            return
        }

        
        
    };



       async getLatestDoctorPrescription(req: Request, res: Response):Promise<void> {

        try{

            const {userId,doctorId} = req.query;
            
            if(userId&&doctorId){
                 const response =await this._prescriptionService.getLatestDoctorPrescription(userId.toString(),doctorId?.toString());
            // if(!response){
            //     res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            //     return
            // }
            res.status(HttpStatusCode.OK).json(response);
            return

            }
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            return

        }catch(error){
            console.log("error in get latest prescription",error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get latest prescription failed"});
            return
        }

        
        
    };



    
}