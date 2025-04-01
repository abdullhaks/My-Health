
import { NextFunction,Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";


@injectable()

export default class AuthController implements IAuthCtrl {

    constructor(){
        
    }

    async userLogin(req:Request,res:Response):Promise<void>{

        try{

            console.log(" log in request is",req.body);

            // return res.status(200).json({"mesg":"haaai"});

        }catch(error){
            console.log(error);
            // return res.status(500)
        }
        
    }
}