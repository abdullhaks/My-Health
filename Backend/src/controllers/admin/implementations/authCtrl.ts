
import { NextFunction,Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";
import IAdminAuthService from "../../../services/admin/interfaces/IAdminAuthService";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()

export default class AdminAuthController implements IAuthCtrl {

    private _adminService: IAdminAuthService;

    constructor( 
        @inject("IAdminAuthService") AdminAuthService:IAdminAuthService

    ){ this._adminService= AdminAuthService}

    async adminLogin(req:Request,res:Response):Promise<any>{

        try{

            const {email,password} = req.body;

            console.log("email and password are ",email,password);
            
            const result =await this._adminService.login(res,{email,password})

            console.log("result is ",result);

            if(!result){
                return res.status(HttpStatusCode.UNAUTHORIZED).json({msg:"Envalid credentials"});
            }
            return res.status(HttpStatusCode.OK).json(result);

        }catch(error){
            console.log(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"Envalid credentials"});
        }
        
    };

      
      async forgotPassword(req:Request,res:Response):Promise<any>{

        try{

           
            const email = req.query.email;

            if (typeof email !== "string") {
              return res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Email must be provided in query" });
            }
            const result = await this._adminService.forgotPassword(email);
            return res.status(HttpStatusCode.OK).json(result);

        }catch(error){
            console.log(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    };


    async getRecoveryPassword(req:Request,res:Response):Promise<any>{

        try{
            const {email} = req.body;
            const resp = this._adminService.forgotPassword(email)
    
            return res.status(HttpStatusCode.OK).json(resp)

        }catch(error){
            console.log(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
       
    };

    async verifyRecoveryPassword(req: Request, res: Response): Promise<any> {
        try {
          const { email, recoveryCode } = req.body;
      
          if (!email || !recoveryCode) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Email and recovery code are required" });
          }
      
          const isValid = await this._adminService.verifyRecoveryPassword(email, recoveryCode);
      
          if (!isValid) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Invalid recovery code" });
          }
      
          return res.status(HttpStatusCode.OK).json({ msg: "Recovery code verified successfully" });
        } catch (error) {
          console.log(error);
          return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "Internal server error" });
        }
      }
      




      async resetPassword(req:Request,res:Response):Promise<any>{
        try{

            const {email} =req.params;
            const {password,confirmPassword} = req.body;

            return res.status(HttpStatusCode.OK).json({email,password,confirmPassword});

        }catch(error){
            console.log(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    };


    async refreshToken(req:Request,res:Response):Promise<any>{
        try{

            const {adminRefreshToken} = req.cookies;

            if(!adminRefreshToken){
                return res.status(HttpStatusCode.UNAUTHORIZED).json({msg:"refresh token not found"});
            }

            const result = await this._adminService.refreshToken(adminRefreshToken);

            if (!result) {
            return res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Refresh token expired" });
          }

          const {accessToken} = result

            console.log("result from ctrl is afrt destructr...", accessToken);

            res.cookie("adminAccessToken", accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false, 
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(HttpStatusCode.OK).json(result);


        }catch(error){
            console.log(error);
            return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({msg:"internal server error"});

        }
    }
} 