import { Router } from "express";
import container from "../../config/inversify";
import IUserAuthCtrl from "../../controllers/user/interfaces/IUserAuthCtrl";
import IUserProfileCtrl from "../../controllers/user/interfaces/IUserProfileCtrl";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";
import IUserAppointmentCtrl from "../../controllers/user/interfaces/IUserAppointmentCtrl";
import IConversationCtrl from "../../controllers/common/interfaces/IConversationCtrl";
import IMessageCtrl from "../../controllers/common/interfaces/IMessageCtrl";
import IUserSessionCtrl from "../../controllers/user/interfaces/IUserSessionCtrl";
import IDetailsCtrl from "../../controllers/common/interfaces/IDetailsCtrl";
import IPaymentCtrl from "../../controllers/common/interfaces/IPaymentCtrl";
import IDirectDocUploadS3Ctrl from "../../controllers/common/interfaces/IDirectDocUploadS3";
import IUserReportAnalysisCtrl from "../../controllers/user/interfaces/IUserReportAnalysisCtrl";
import INotificationCtrl from "../../controllers/common/interfaces/INotificationCtrl";
import IUserBlogCtrl from "../../controllers/user/interfaces/IUserBlogCtrl";
import IUserDashboardCtrl from "../../controllers/user/interfaces/IUserDashboardCtrl";
import IUserPrescriptionCtrl from "../../controllers/user/interfaces/IUserPrescriptionCtrl";
import IUserTransactionController from "../../controllers/user/interfaces/IUserTransactionController";
import { resolve } from "path";

const userRoutes = Router();

const authCtrl = container.get<IUserAuthCtrl>("IUserAuthCtrl");
const profileCtrl = container.get<IUserProfileCtrl>("IUserProfileCtrl");
const appointmentCtrl = container.get<IUserAppointmentCtrl>("IUserAppointmentCtrl");
const conversationCtrl = container.get<IConversationCtrl>("IConversationCtrl");
const messageCtrl = container.get<IMessageCtrl>("IMessageCtrl");
const sessionCtrl = container.get<IUserSessionCtrl>("IUserSessionCtrl");
const detailsCtrl = container.get<IDetailsCtrl>("IDetailsCtrl");
const paymentCtrl =  container.get<IPaymentCtrl>("IPaymentCtrl");
const directUploadCtrl = container.get<IDirectDocUploadS3Ctrl>("IDirectDocUploadS3Ctrl");
const reportAnalysisCtrl = container.get<IUserReportAnalysisCtrl>("IUserReportAnalysisCtrl");
const notificationCtrl = container.get<INotificationCtrl>("INotificationCtrl");
const blogCtrl = container.get<IUserBlogCtrl>("IUserBlogCtrl");
const dashboardCtrl = container.get<IUserDashboardCtrl>("IUserDashboardCtrl");
const prescriptionCtrl = container.get<IUserPrescriptionCtrl>("IUserPrescriptionCtrl");
const transactionCtrl = container.get<IUserTransactionController>("IUserTransactionController");



userRoutes.post("/login",(req,res)=>authCtrl.userLogin(req,res));

userRoutes.post("/logout",(req,res)=>authCtrl.userLogout(req,res))

userRoutes.post("/signup",(req,res,next)=>authCtrl.userSignup(req,res,next));

userRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

userRoutes.post("/verifyOtp",(req,res)=>authCtrl.verifyOtp(req,res));

userRoutes.get("/resentOtp",(req,res)=>authCtrl.resentOtp(req,res));

userRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

userRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

userRoutes.post("/verifyRecoveryPassword",(req,res)=>authCtrl.verifyRecoveryPassword(req,res));

userRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

userRoutes.patch("/changePassword/:id",(req,res)=>profileCtrl.changePassword(req,res))

userRoutes.patch("/updateProfile/:id",verifyAccessTokenMidleware("user"),( req,res)=>profileCtrl.updateProfile(req,res));

userRoutes.patch("/updateDp/:id" ,verifyAccessTokenMidleware("user"), upload.single("profile"),
uploadToS3("users/profile-images",true), (req,res)=>profileCtrl.updateDp(req,res));

userRoutes.post(
  "/directFileUpload",
  verifyAccessTokenMidleware("user"),
  upload.single("doc"),
  (req, res) => directUploadCtrl.directUpload(req, res)
);


userRoutes.get("/google", authCtrl.googleLoginRedirect); 
userRoutes.get("/google/callback", authCtrl.googleCallback); 

userRoutes.get("/me", authCtrl.getMe.bind(authCtrl));

userRoutes.get("/doctors",verifyAccessTokenMidleware("user"), (req,res)=>appointmentCtrl.fetchingDoctors(req,res));

userRoutes.post(
  "/conversation",
  verifyAccessTokenMidleware("user"),
  (req, res) => conversationCtrl.createConversation(req, res)
);


userRoutes.get(
  "/conversation/:doctorId",
  verifyAccessTokenMidleware("user"),
  (req, res) => conversationCtrl.getConversations(req, res)
);

userRoutes.get(
  "/message/:conversationId",
  verifyAccessTokenMidleware("user"),
  (req, res) => messageCtrl.getMessages(req, res)
);


userRoutes.post(
  "/message",
  verifyAccessTokenMidleware("user"),
  (req, res) => messageCtrl.sendMessage(req, res)
);

userRoutes.get("/sessions",verifyAccessTokenMidleware("user"),(req,res)=> sessionCtrl.getSessions(req,res) );

userRoutes.get("/doctorDetails",verifyAccessTokenMidleware("user"),(req,res)=>detailsCtrl.getDoctor(req,res) )

userRoutes.post(
  "/stripe/create-one-time-payment",
  verifyAccessTokenMidleware("user"),
  (req,res)=>paymentCtrl.createOneTimePaymentSession(req,res)
);

userRoutes.get("/getAppointments",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.getAppointments(req,res))


userRoutes.patch("/cancelAppointment",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.cancelAppointment(req,res))

userRoutes.get("/getAnalysisReports", verifyAccessTokenMidleware("user"), (req, res) =>
  reportAnalysisCtrl.getReports(req, res)) 

userRoutes.post("/cancelAnalysisReports", verifyAccessTokenMidleware("user"), (req, res) =>
  reportAnalysisCtrl.cancelAnalysisReports(req, res));

userRoutes.get("/bookedSlots",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getBookedSlots(req,res))

userRoutes.post("/walletPayment",verifyAccessTokenMidleware("user"),(req,res)=> appointmentCtrl.walletPayment(req,res))

userRoutes.get("/notifications",verifyAccessTokenMidleware("user"),(req,res)=> notificationCtrl.getNewNotifications(req,res) )

userRoutes.get("/getBlogs",verifyAccessTokenMidleware("user"),(req,res)=>blogCtrl.getBlogs(req,res));

userRoutes.get("/dashboard",verifyAccessTokenMidleware("user"),(req,res)=> dashboardCtrl.getDashboardContent(req,res));

userRoutes.get("/prescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getPrescription(req,res) );
userRoutes.get("/latestPrescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getLatestPrescription(req,res) );
userRoutes.get("/latestDoctorPrescription",verifyAccessTokenMidleware("user"),(req,res)=> prescriptionCtrl.getLatestDoctorPrescription(req,res) );


userRoutes.get("/unAvailableDays",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getUnavailableDays(req,res));

userRoutes.get("/unAvailableSessions",verifyAccessTokenMidleware("user"),(req,res)=>sessionCtrl.getUnavailablSessions(req,res));

userRoutes.get("/activeBooking",verifyAccessTokenMidleware("user"),(req,res)=>appointmentCtrl.activeBooking(req,res));

userRoutes.get("/getTransactions",verifyAccessTokenMidleware("user"),(req,res)=>transactionCtrl.getTransactions(req,res));


export default userRoutes; 