import {inject,injectable} from "inversify"
import IUserPrescriptionService from "../../../services/user/interfaces/IUserPrescriptionService";
import IUserPrescriptionCtrl from "../interfaces/IPrescriptionCtrl";
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



    
}