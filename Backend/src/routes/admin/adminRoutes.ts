import { Router } from "express";
import container from "../../config/inversify";
import IAdminAuthCtrl from "../../controllers/admin/interfaces/IAuthCtrl";
import {verifyAdminAccessToken} from "../../middlewares/admin/checkAccessToken";

const adminRoutes = Router();

const authCtrl = container.get<IAdminAuthCtrl>("IAdminAuthCtrl");

adminRoutes.post("/login",(req,res)=>authCtrl.adminLogin(req,res));

adminRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

adminRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

adminRoutes.post("verifyRecoveryPassword")

adminRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

adminRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

export default adminRoutes; 