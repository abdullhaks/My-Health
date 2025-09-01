
import { Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAdminAuthCtrl";
import { inject,injectable } from "inversify";
import IAdminAuthService from "../../../services/admin/interfaces/IAdminAuthService";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()

export default class AdminAuthController implements IAuthCtrl {

 

    constructor( 
        @inject("IAdminAuthService")   private _adminAuthService:IAdminAuthService

    ){ }

    async adminLogin(req:Request,res:Response):Promise<void>{

        try{

            const {email,password} = req.body;

            console.log("email and password are ",email,password);
            
            const result =await this._adminAuthService.login({email,password})

            console.log("result is ",result);

            if(!result){
                res.status(HttpStatusCode.UNAUTHORIZED).json({msg:"Envalid credentials"});
                return
            };


             res.cookie("adminRefreshToken", result.refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                });

            res.cookie("adminAccessToken", result.accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false, 
                maxAge: 7 * 24 * 60 * 60 * 1000,
                }); 

             res.status(HttpStatusCode.OK).json({message:result.message,admin:result.admin});

        }catch(error){
            console.log(error);
             res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"Envalid credentials"});
        }
        
    };

      
      async forgotPassword(req:Request,res:Response):Promise<void>{

        try{

           
            const email = req.query.email;

            if (!email || typeof email !== "string") {
            //    res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Email must be provided in query" });
            throw new Error("Email missing")
            }
            const result = await this._adminAuthService.forgotPassword(email);
             res.status(HttpStatusCode.OK).json(result);

        }catch(error){
            console.log(error);
             res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    };


    async getRecoveryPassword(req:Request,res:Response):Promise<void>{

        try{
            const {email} = req.body;
            const resp = this._adminAuthService.forgotPassword(email)
    
             res.status(HttpStatusCode.OK).json(resp)

        }catch(error){
            console.log(error);
             res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
       
    };

    async verifyRecoveryPassword(req: Request, res: Response): Promise<void> {
        try {
          const { email, recoveryCode } = req.body;
      
          if (!email || !recoveryCode) {
             res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Email and recovery code are required" });
          }
      
          const isValid = await this._adminAuthService.verifyRecoveryPassword(email, recoveryCode);
      
          if (!isValid) {
             res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Invalid recovery code" });
          }
      
           res.status(HttpStatusCode.OK).json({ msg: "Recovery code verified successfully" });
        } catch (error) {
          console.log(error);
           res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }
      }
      




      async resetPassword(req:Request,res:Response):Promise<void>{
        try{

            const {email} =req.params;
            const {password,confirmPassword} = req.body;

             res.status(HttpStatusCode.OK).json({email,password,confirmPassword});

        }catch(error){
            console.log(error);
             res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    };


    async refreshToken(req:Request,res:Response):Promise<void>{
        try{
            const {adminRefreshToken} = req.cookies;
            if(!adminRefreshToken){
                 res.status(HttpStatusCode.UNAUTHORIZED).json({msg:"refresh token not found"});
                 return
            }
            const result = await this._adminAuthService.refreshToken(adminRefreshToken);
            if (!result) {
             res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Refresh token expired" });
             return
          }

          const {accessToken} = result

            console.log("result from ctrl is afrt destructr...", accessToken);

            res.cookie("adminAccessToken", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false, 
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

             res.status(HttpStatusCode.OK).json(result);


        }catch(error){
            console.log(error);
             res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    }
} 