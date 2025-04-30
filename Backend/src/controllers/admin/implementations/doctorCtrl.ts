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

        console.log("reqest.params from get doctors...",req.params);

    }

}