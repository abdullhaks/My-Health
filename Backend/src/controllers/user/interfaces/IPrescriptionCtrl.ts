import {Request,Response} from "express"

export default interface IUserPrescriptionCtrl {
    
getPrescription(req:Request,res:Response):Promise<void>


}