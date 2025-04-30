import { Router } from "express";
import container from "../../config/inversify";
import IAdminAuthCtrl from "../../controllers/admin/interfaces/IAuthCtrl";
import IAdminUserCtrl from "../../controllers/admin/interfaces/IUserCtrl";
import IAdminDoctorCtrl from "../../controllers/admin/interfaces/IDoctorCtrl";
import { verifyAccessToken } from "../../middlewares/common/checkAccessToken";
import { resolve } from "path/win32";

const adminRoutes = Router();

const authCtrl = container.get<IAdminAuthCtrl>("IAdminAuthCtrl");
const userCtrl = container.get<IAdminUserCtrl>("IAdminUserCtrl");
const doctorCtrl = container.get<IAdminDoctorCtrl>("IAdminDoctorCtrl");

adminRoutes.post("/login",(req,res)=>authCtrl.adminLogin(req,res));

adminRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

adminRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

adminRoutes.post("verifyRecoveryPassword")

adminRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

adminRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

adminRoutes.get("/users",(req,res)=>userCtrl.getUsers(req,res));

adminRoutes.get("/doctors",(req,res)=>doctorCtrl.getDoctors(req,res))



export default adminRoutes; 