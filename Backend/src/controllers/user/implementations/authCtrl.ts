
import { NextFunction,Request,Response } from "express";
import IUserAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";
import IUserAuthService from "../../../services/user/interfaces/IUserAuthServices";


@injectable()

export default class UserAuthController implements IUserAuthCtrl {

    private _userService: IUserAuthService;

    constructor( 
        @inject("IUserAuthService") UserAuthService:IUserAuthService

    ){ this._userService= UserAuthService}

    async userLogin(req:Request,res:Response):Promise<any>{

        try{

            const {email,password} = req.body;

            const result =await this._userService.login(res,{email,password});

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


    async userSignup(req:Request,res:Response,next:NextFunction):Promise<any>{

        try{
            const {fullName,email,password,confirmPassword} = req.body;

            const userDetails = {fullName,email,password,confirmPassword};

            console.log("user details is ",userDetails);
            
            const user =await this._userService.signup(userDetails);

            console.log("user  is ",user);


            return res.status(200).json(user)

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
        
    };


    async verifyOtp(req:Request,res:Response):Promise<any>{
        try{

            const{otp,email} = req.body;

            console.log(`otp is ${otp} & email is ${email}`);

            const otpRecord = await this._userService.verifyOtp(email,otp);
            return res.status(200).json({otp,email});

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    };


    async resentOtp(req: Request, res: Response): Promise<any> {
        try {
          const { email } = req.query;
          if (!email || typeof email !== "string") {
            return res.status(400).json({ msg: "Email is required" });
          }
      
          const result = await this._userService.resentOtp(email);
          return res.status(200).json(result);
        } catch (error: any) {
          console.error(error);
          return res.status(500).json({ msg: error.message || "Internal server error" });
        }
      }
      
      async forgotPassword(req:Request,res:Response):Promise<any>{

        try{

           
            const email = req.query.email;

            if (typeof email !== "string") {
              return res.status(400).json({ msg: "Email must be provided in query" });
            }
            const result = await this._userService.forgotPassword(email);
            return res.status(200).json(result);

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    };


    async getRecoveryPassword(req:Request,res:Response):Promise<any>{

        try{
            const {email} = req.body;
            const resp = this._userService.forgotPassword(email)
    
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
      
          const isValid = await this._userService.verifyRecoveryPassword(email, recoveryCode);
      
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
    };


    async refreshToken(req:Request,res:Response):Promise<any>{
        try{

            const {userRefreshToken} = req.cookies;

            if(!userRefreshToken){
                return res.status(401).json({msg:"refresh token not found"});
            }

            const result = await this._userService.refreshToken(userRefreshToken);

            return res.status(200).json(result);


        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    }
} 