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

adminRoutes.patch("/users/:id/block",(req,res)=>userCtrl.block(req,res))
adminRoutes.patch("/users/:id/unblock",(req,res)=>userCtrl.unblock(req,res))


adminRoutes.get("/doctors",(req,res)=>doctorCtrl.getDoctors(req,res)) 
adminRoutes.get("/doctor/:id",(req,res)=>doctorCtrl.getDoctor(req,res)) 


adminRoutes.patch("/doctor/:id/verify",(req,res)=>doctorCtrl.verifyDoctor(req,res))
adminRoutes.patch("/doctor/:id/decline",(req,res)=>doctorCtrl.declineDoctor(req,res))

adminRoutes.patch("/doctors/:id/block",(req,res)=>doctorCtrl.block(req,res))
adminRoutes.patch("/doctors/:id/unblock",(req,res)=>doctorCtrl.unblock(req,res))

export default adminRoutes; 