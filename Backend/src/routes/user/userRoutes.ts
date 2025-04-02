import { Router } from "express";
import container from "../../config/inversify";
import IAuthCtrl from "../../controllers/user/interfaces/IAuthCtrl";

const userRoutes = Router();

const authCtrl = container.get<IAuthCtrl>("IAuthCtrl");

userRoutes.post("/login",(req,res)=>authCtrl.userLogin(req,res));

userRoutes.post("/signup",(req,res,next)=>authCtrl.userSignup(req,res,next));

userRoutes.post("/verifyOtp",(req,res)=>authCtrl.verifyOtp(req,res));

userRoutes.get("/resentOtp",(req,res)=>authCtrl.resentOtp(req,res));

userRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

userRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

export default userRoutes; 