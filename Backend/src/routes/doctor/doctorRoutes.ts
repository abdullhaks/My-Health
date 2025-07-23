import { Router } from "express";
import container from "../../config/inversify";
import IDoctorAuthCtrl from "../../controllers/doctor/interfaces/IAuthCtrl";
import IDoctorProfileCtrl from "../../controllers/doctor/interfaces/IProfileCtrl";
import IDoctorAppointmentController from "../../controllers/doctor/interfaces/IAppointmentCtrl";
import IDoctorPlanCtrl from "../../controllers/doctor/interfaces/IPlanCtrl";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";
import IConversationCtrl from "../../controllers/common/interfaces/IConversationCtrl";
import IMessageCtrl from "../../controllers/common/interfaces/IMessageCtrl";
import ISessionCtrl from "../../controllers/doctor/interfaces/ISessionCtrl";
import IDoctorReportAnalysisCtrl from "../../controllers/doctor/interfaces/IReportAnalysisCtrl";
import IDirectDocUploadS3Ctrl from "../../controllers/common/interfaces/IDirectDocUploadS3";
import IDoctorBlogController from "../../controllers/doctor/interfaces/IBlogCtrl";
import IDoctorAdvertisementController from "../../controllers/doctor/interfaces/IAdvertisementCtrl";

const doctorRoutes = Router();

const authCtrl = container.get<IDoctorAuthCtrl>("IDoctorAuthCtrl");
const profileCtrl = container.get<IDoctorProfileCtrl>("IDoctorProfileCtrl");
const conversationCtrl = container.get<IConversationCtrl>("IConversationCtrl");
const messageCtrl = container.get<IMessageCtrl>("IMessageCtrl")
const sessionCtrl = container.get<ISessionCtrl>("IDoctorSessionCtrl");
const appointmentCtrl = container.get<IDoctorAppointmentController>("IDoctorAppointmentController");
const ReportAnalysisCtrl = container.get<IDoctorReportAnalysisCtrl>("IDoctorReportAnalysisCtrl");
const directUploadCtrl = container.get<IDirectDocUploadS3Ctrl>("IDirectDocUploadS3Ctrl");
const planCtrl = container.get<IDoctorPlanCtrl>("IDoctorPlanCtrl");
const blogCtrl = container.get<IDoctorBlogController>("IDoctorBlogController");
const addCtrl = container.get<IDoctorAdvertisementController>("IDoctorAdvertisementController")



doctorRoutes.post("/login", (req, res,next) => authCtrl.doctorLogin(req, res,next));

// doctorRoutes.post("/logout",(req,res)=>authCtrl.doctorLogout(req,res))

doctorRoutes.post(
  "/signup",
  upload.fields([
    { name: "registrationCertificate", maxCount: 1 },
    { name: "graduationCertificate", maxCount: 1 },
    { name: "verificationId", maxCount: 1 },
    { name: "specializations[0][certificate]", maxCount: 1 },
  ]),
  (req, res ,next) => authCtrl.doctorSignup(req, res ,next)
);

doctorRoutes.post("/refreshToken", (req, res,next) =>
  authCtrl.refreshToken(req, res,next)
);

doctorRoutes.post("/verifyOtp", (req, res,next) => authCtrl.verifyOtp(req, res,next));

doctorRoutes.get("/resentOtp", (req, res,next) => authCtrl.resentOtp(req, res,next));

doctorRoutes.patch("/updateProfile/:id",verifyAccessTokenMidleware("doctor"),( req,res)=>profileCtrl.updateProfile(req,res));

doctorRoutes.patch(
  "/updateDp/:id",
  upload.single("profile"),
  verifyAccessTokenMidleware("doctor"),
  uploadToS3("doctors/profile-images", true),
  (req, res) => profileCtrl.updateDp(req, res)
);

doctorRoutes.post(
  "/directFileUpload",
  verifyAccessTokenMidleware("doctor"),
  upload.single("doc"),
  (req, res) => directUploadCtrl.directUpload(req, res)
);


doctorRoutes.post(
  "/stripe/create-checkout-session", 
  verifyAccessTokenMidleware("doctor"),
  profileCtrl.createCheckoutSession
);

doctorRoutes.post("/verifySubscription", (req, res) =>
  profileCtrl.verifyingSubscription(req, res)
);

// doctorRoutes.get("/me", authCtrl.getMe.bind(authCtrl));

doctorRoutes.post(
  "/conversation",
  verifyAccessTokenMidleware("doctor"),
  (req, res) => conversationCtrl.createConversation(req, res)
);


doctorRoutes.get(
  "/conversation/:doctorId",
  verifyAccessTokenMidleware("doctor"),
  (req, res) => conversationCtrl.getConversations(req, res)
);

doctorRoutes.get(
  "/message/:conversationId",
  verifyAccessTokenMidleware("doctor"),
  (req, res) => messageCtrl.getMessages(req, res)
);


doctorRoutes.post(
  "/message",
  verifyAccessTokenMidleware("doctor"),
  (req, res) => messageCtrl.sendMessage(req, res)
);


doctorRoutes.post("/sessions",verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.addSessions(req,res));

doctorRoutes.get("/sessions",verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.getSessions(req,res) );

doctorRoutes.get("/getAppointments",verifyAccessTokenMidleware("doctor"),(req,res)=>appointmentCtrl.getAppointments(req,res))

doctorRoutes.get("/getAnalysisReports", verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.getReports(req, res)) 

doctorRoutes.post("/submitAnalysisReports", verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.submitAnalysisReports(req, res));

doctorRoutes.post("/cancelAnalysisReports", verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.cancelAnalysisReports(req, res));

doctorRoutes.get("/getSubscriptions",verifyAccessTokenMidleware("doctor"),(req,res)=>planCtrl.getProducts(req,res))

doctorRoutes.get("/getBlogs",verifyAccessTokenMidleware("doctor"),(req,res)=>blogCtrl.getBlogs(req,res));

doctorRoutes.post("/blog",verifyAccessTokenMidleware("doctor"),(req,res)=>blogCtrl.createBlog(req,res));

doctorRoutes.post("/advertisement",verifyAccessTokenMidleware("doctor"),(req,res)=>addCtrl.createAdvertisement(req,res));

doctorRoutes.get("/advertisements",verifyAccessTokenMidleware("doctor"),(req,res)=>addCtrl.getAdds(req,res));



export default doctorRoutes;

