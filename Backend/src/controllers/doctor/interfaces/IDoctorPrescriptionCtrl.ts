import {Request,Response} from "express"

export default interface IDoctorPrescriptionCtrl {
    
getPrescriptions(req:Request,res:Response):Promise<void>
submitPrescription(req:Request,res:Response):Promise<void>


}