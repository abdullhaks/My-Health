import {inject,injectable} from "inversify"
import IDoctorPrescriptionService from "../../../services/doctor/interfaces/IDoctorPrescriptionService";
import IDoctorPrescriptionCtrl from "../interfaces/IDoctorPrescriptionCtrl";
import { Request, Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";



@injectable()
export default class DoctorPrescriptionController implements IDoctorPrescriptionCtrl {

    constructor (
        @inject("IDoctorPrescriptionService") private _doctorPrescriptionService : IDoctorPrescriptionService
    ){}


    async getPrescriptions(req: Request, res: Response):Promise<void> {

        try{

            const {userId} = req.query
            if(userId){
                 const response =await this._doctorPrescriptionService.getPrescriptions(userId.toString());
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



    async submitPrescription(req: Request, res: Response): Promise<void> {

        try{

            console.log("prescriptionData from backend is ",req.body.prescriptionData)
             const {prescriptionData} = req.body;


        const response = await this._doctorPrescriptionService.submitPrescription(prescriptionData);
        if(!response){
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
            return
        };

        res.status(HttpStatusCode.OK).json(response);
            return

        }catch(error){
            res.status(HttpStatusCode.BAD_REQUEST).json({message:"post prescription failed.."});
            return
        }
 
    }
}