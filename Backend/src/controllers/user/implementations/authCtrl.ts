
import { NextFunction,Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";
import IUserAuthService from "../../../services/user/interfaces/IUserAuthServices";


@injectable()

export default class AuthController implements IAuthCtrl {

    private _userService: IUserAuthService;

    constructor( 
        @inject("IUserAuthService") UserAuthService:IUserAuthService

    ){ this._userService= UserAuthService}

    async userLogin(req:Request,res:Response):Promise<any>{

        try{

            const {email,password} = req.body;

            const result =await this._userService.login(res,{email,password});

            console.log("result is ",result);

            return res.status(200).json(result);

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});
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


    async resentOtp(req:Request,res:Response):Promise<any>{
        try{

            const newOtp = "239239";
            const {email} = req.query;
            return res.status(200).json({otp:newOtp,email})

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
    };


    async getRecoveryPassword(req:Request,res:Response):Promise<any>{

        try{
            const {email} = req.query;
            const recPass = "sdfj4r22343";
    
            return res.status(200).json({email,recPass})

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
       
    };

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