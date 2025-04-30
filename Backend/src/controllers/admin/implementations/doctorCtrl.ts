import { NextFunction,Request,Response } from "express";
import IAdminDoctorCtrl from "../interfaces/IDoctorCtrl";
import { inject,injectable } from "inversify";
import IAdminDoctorService from "../../../services/admin/interfaces/IAdminDoctorService";

@injectable()

export default class AdminDoctorController implements IAdminDoctorCtrl {

    private _adminService: IAdminDoctorService;

    constructor( 
        @inject("IAdminDoctorService") AdminDoctorService:IAdminDoctorService

    ){ this._adminService= AdminDoctorService}

    async getDoctors(req:Request,res:Response):Promise<any>{

        const { page, search, limit } = req.query;
        console.log("reqest.params from get users...", search, page, limit);

        const pageNumber = page ? parseInt(page as string, 10) : 1;
        const limitNumber = limit ? parseInt(limit as string, 10) : 10;

        const result = await this._adminService.getDoctors(pageNumber, search as string | undefined, limitNumber);

        if(!result){
            return res.status(401).json({msg:"fetching doctors has been fialed "});
        }
        return res.status(200).json(result);
    }

}