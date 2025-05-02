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

        const { page, search, limit } = req.query;
        console.log("reqest.params from get users...", search, page, limit);

        const pageNumber = page ? parseInt(page as string, 10) : 1;
        const limitNumber = limit ? parseInt(limit as string, 10) : 10;

        const result = await this._adminService.getUsers(pageNumber, search as string | undefined, limitNumber);

        if(!result){
            return res.status(401).json({msg:"fetching users has been fialed "});
        }
        return res.status(200).json(result);
    };

    async block(req:Request,res:Response):Promise<any>{

        const {id} = req.params;

        console.log("user id for block...",id);

        const result = this._adminService.block(id);

        console.log("resposne form user blocking ctrl..",result);

        if(!result){
            return res.status(401).json({msg:"blocking users has been fialed "});
        }
        return res.status(200).json(result);

    };


    

    async unblock(req:Request,res:Response):Promise<any>{

        const {id} = req.params;

        console.log("user id for block...",id);

        const result = this._adminService.unblock(id);

        console.log("resposne form user blocking ctrl..",result);

        if(!result){
            return res.status(401).json({msg:"blocking users has been fialed "});
        }
        return res.status(200).json(result);

    };

}