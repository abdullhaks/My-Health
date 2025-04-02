
import { NextFunction,Request,Response } from "express";
import IAuthCtrl from "../interfaces/IAuthCtrl";
import { inject,injectable } from "inversify";


@injectable()

export default class AuthController implements IAuthCtrl {

    constructor(){
        
    }

    async userLogin(req:Request,res:Response):Promise<any>{

        try{

            const {email,password} = req.body;
            const userData = {email,password};
            console.log(" log in request is",req.body);

            return res.status(200).json(userData);

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});
        }
        
    };


    async userSignup(req:Request,res:Response,next:NextFunction):Promise<any>{

        try{
            const {fullname,email,password,confirmPassword,phone,gender,dob,geoLocation} = req.body;

            const userDetails = {fullname,email,password,confirmPassword,phone,gender,dob,geoLocation};

            console.log("user details is ",userDetails);

            return res.status(200).json(userDetails)

        }catch(error){
            console.log(error);
            return res.status(500).json({msg:"internal server error"});

        }
        
    };


    async verifyOtp(req:Request,res:Response):Promise<any>{
        try{

            const{otp,email} = req.body;

            console.log(`otp is ${otp} & email is ${email}`);
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