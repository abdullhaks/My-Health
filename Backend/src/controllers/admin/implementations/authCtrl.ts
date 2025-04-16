
import { NextFunction,Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";
import IAdminAuthService from "../../../services/admin/interfaces/IAdminAuthService";


@injectable()

export default class AdminAuthController implements IAuthCtrl {

    private _adminService: IAdminAuthService;

    constructor( 
        @inject("IAdminAuthService") AuthService:IAdminAuthService

    ){ this._adminService= AuthService}

    async adminLogin(req:Request,res:Response):Promise<any>{

        try{

            const {email,password} = req.body;

            console.log("email and password are ",email,password);
            
            const result =await this._adminService.login(res,{email,password});

            console.log("result is ",result);

            if(!result){
                return res.status(401).json({msg:"Envalid credentials"});
            }
            return res.status(200).json(result);

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"Envalid credentials"});
        }
        
    };

      
      async forgotPassword(req:Request,res:Response):Promise<any>{

        try{

           
            const email = req.query.email;

            if (typeof email !== "string") {
              return res.status(400).json({ msg: "Email must be provided in query" });
            }
            const result = await this._adminService.forgotPassword(email);
            return res.status(200).json(result);

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    };


    async getRecoveryPassword(req:Request,res:Response):Promise<any>{

        try{
            const {email} = req.body;
            const resp = this._adminService.forgotPassword(email)
    
            return res.status(200).json(resp)

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
       
    };

    async verifyRecoveryPassword(req: Request, res: Response): Promise<any> {
        try {
          const { email, recoveryCode } = req.body;
      
          if (!email || !recoveryCode) {
            return res.status(400).json({ msg: "Email and recovery code are required" });
          }
      
          const isValid = await this._adminService.verifyRecoveryPassword(email, recoveryCode);
      
          if (!isValid) {
            return res.status(400).json({ msg: "Invalid recovery code" });
          }
      
          return res.status(200).json({ msg: "Recovery code verified successfully" });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ msg: "Internal server error" });
        }
      }
      




      async resetPassword(req:Request,res:Response):Promise<any>{
        try{

            const {email} =req.params;
            const {password,confirmPassword} = req.body;

            return res.status(200).json({email,password,confirmPassword});

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    }
} 