import { NextFunction,Request,Response } from "express";
import IAdminUserCtrl from "../interfaces/IUserCtrl";
import { inject,injectable } from "inversify";
import IAdminUserService from "../../../services/admin/interfaces/IAdminUserService";

@injectable()

export default class AdminUserController implements IAdminUserCtrl {

    private _adminService: IAdminUserService;

    constructor( 
        @inject("IAdminUserService") AdminUserService:IAdminUserService

    ){ this._adminService= AdminUserService}

    async getUsers(req:Request,res:Response):Promise<any>{

        console.log("reqest.params from get users...",req.params);

    }

}