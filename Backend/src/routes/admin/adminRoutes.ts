import { Router } from "express";
import container from "../../config/inversify";
import IAdminAuthCtrl from "../../controllers/admin/interfaces/IAuthCtrl";
import IAdminUserCtrl from "../../controllers/admin/interfaces/IUserCtrl";
import IAdminDoctorCtrl from "../../controllers/admin/interfaces/IDoctorCtrl";
import IAdminProductCtrl from "../../controllers/admin/interfaces/IProductCtrl";
import IAdminAppointmentController from "../../controllers/admin/interfaces/IAppointmentCtrl";
import IAdminAnalyticsController from "../../controllers/admin/interfaces/IAnalyticsCtrl";
import IAdminTransactionController from "../../controllers/admin/interfaces/ITransactionCtrl";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";


const adminRoutes = Router();

const authCtrl = container.get<IAdminAuthCtrl>("IAdminAuthCtrl");
const userCtrl = container.get<IAdminUserCtrl>("IAdminUserCtrl");
const doctorCtrl = container.get<IAdminDoctorCtrl>("IAdminDoctorCtrl");
const productCtrl = container.get<IAdminProductCtrl>("IAdminProductCtrl");
const appointmentCtrl = container.get<IAdminAppointmentController>("IAdminAppointmentController");
const analyticsCtrl = container.get<IAdminAnalyticsController>("IAdminAnalyticsController");
const transactionCtrl = container.get<IAdminTransactionController>("IAdminTransactionController");


adminRoutes.post("/login",(req,res)=>authCtrl.adminLogin(req,res));

adminRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

adminRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

adminRoutes.post("verifyRecoveryPassword")

adminRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

adminRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

adminRoutes.get("/users",verifyAccessTokenMidleware("admin"),(req,res)=>userCtrl.getUsers(req,res));

adminRoutes.patch("/users/:id/block",verifyAccessTokenMidleware("admin"),(req,res)=>userCtrl.block(req,res))
adminRoutes.patch("/users/:id/unblock",verifyAccessTokenMidleware("admin"),(req,res)=>userCtrl.unblock(req,res))


adminRoutes.get("/doctors",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.getDoctors(req,res)) 
adminRoutes.get("/doctor/:id",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.getDoctor(req,res)) 


adminRoutes.patch("/doctor/:id/verify",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.verifyDoctor(req,res))
adminRoutes.patch("/doctor/:id/decline",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.declineDoctor(req,res))

adminRoutes.patch("/doctors/:id/block",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.block(req,res));
adminRoutes.patch("/doctors/:id/unblock",verifyAccessTokenMidleware("admin"),(req,res)=>doctorCtrl.unblock(req,res));

adminRoutes.get("/getSubscriptions",verifyAccessTokenMidleware("admin"),(req,res)=>productCtrl.getProducts(req,res))
adminRoutes.put("/updateSubscription",verifyAccessTokenMidleware("admin"),(req,res)=>productCtrl.updateProduct(req,res));
adminRoutes.delete("/deleteSubscription/:id",verifyAccessTokenMidleware("admin"),(req,res)=>productCtrl.deleteProduct(req,res))
adminRoutes.post("/createSubscription",verifyAccessTokenMidleware("admin"),(req,res)=>productCtrl.createProduct(req,res));

adminRoutes.get("/getAppointments",verifyAccessTokenMidleware("admin"),(req,res)=>appointmentCtrl.getAppointments(req,res));

adminRoutes.get("/getUserAnalytics/:filter",verifyAccessTokenMidleware("admin"),(req,res)=>analyticsCtrl.getUserAnalytics(req,res));
adminRoutes.get("/getDoctorAnalytics/:filter",verifyAccessTokenMidleware("admin"),(req,res)=>analyticsCtrl.getDoctorAnalytics(req,res));
adminRoutes.get("/getTotalAnalytics",verifyAccessTokenMidleware("admin"),(req,res)=>analyticsCtrl.getTotalAnalytics(req,res));

adminRoutes.get("/getTransactions",verifyAccessTokenMidleware("admin"),(req,res)=>transactionCtrl.getTransactions(req,res));

export default adminRoutes; 