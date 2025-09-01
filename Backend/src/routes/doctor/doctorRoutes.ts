import { Router } from "express";
import container from "../../config/inversify";
import IDoctorAuthCtrl from "../../controllers/doctor/interfaces/IDoctorAuthCtrl";
import IDoctorProfileCtrl from "../../controllers/doctor/interfaces/IDoctorProfileCtrl";
import IDoctorAppointmentCtrl from "../../controllers/doctor/interfaces/IDoctorAppointmentCtrl";
import IDoctorPlanCtrl from "../../controllers/doctor/interfaces/IDoctorPlanCtrl";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";
import { verifyIsPremiume } from "../../middlewares/common/checkIsPremiume";
import IConversationCtrl from "../../controllers/common/interfaces/IConversationCtrl";
import IMessageCtrl from "../../controllers/common/interfaces/IMessageCtrl";
import ISessionCtrl from "../../controllers/doctor/interfaces/IDoctorSessionCtrl";
import IDoctorReportAnalysisCtrl from "../../controllers/doctor/interfaces/IDoctorReportAnalysisCtrl";
import IDirectDocUploadS3Ctrl from "../../controllers/common/interfaces/IDirectDocUploadS3";
import IDoctorBlogCtrl from "../../controllers/doctor/interfaces/IDoctorBlogCtrl";
import IDoctorAdvertisementCtrl from "../../controllers/doctor/interfaces/IDoctorAdvertisementCtrl";
import IDoctorPrescriptionCtrl from "../../controllers/doctor/interfaces/IDoctorPrescriptionCtrl";
import IDetailsCtrl from "../../controllers/common/interfaces/IDetailsCtrl";
import IDoctorDashboardCtrl from "../../controllers/doctor/interfaces/IDoctorDashboardCtrl";
import IDoctorPayoutCtrl from "../../controllers/doctor/interfaces/IDoctorPayoutCtrl";
import INotificationCtrl from "../../controllers/common/interfaces/INotificationCtrl";
import IDoctorTransactionController from "../../controllers/doctor/interfaces/IDoctorTransactionController";



const doctorRoutes = Router();

const authCtrl = container.get<IDoctorAuthCtrl>("IDoctorAuthCtrl");
const profileCtrl = container.get<IDoctorProfileCtrl>("IDoctorProfileCtrl");
const conversationCtrl = container.get<IConversationCtrl>("IConversationCtrl");
const messageCtrl = container.get<IMessageCtrl>("IMessageCtrl")
const sessionCtrl = container.get<ISessionCtrl>("IDoctorSessionCtrl");
const appointmentCtrl = container.get<IDoctorAppointmentCtrl>("IDoctorAppointmentCtrl");
const ReportAnalysisCtrl = container.get<IDoctorReportAnalysisCtrl>("IDoctorReportAnalysisCtrl");
const directUploadCtrl = container.get<IDirectDocUploadS3Ctrl>("IDirectDocUploadS3Ctrl");
const planCtrl = container.get<IDoctorPlanCtrl>("IDoctorPlanCtrl");
const blogCtrl = container.get<IDoctorBlogCtrl>("IDoctorBlogCtrl");
const addCtrl = container.get<IDoctorAdvertisementCtrl>("IDoctorAdvertisementCtrl")
const notificationCtrl = container.get<INotificationCtrl>("INotificationCtrl")
const prescriptionsCtrl = container.get<IDoctorPrescriptionCtrl>("IDoctorPrescriptionCtrl")
const detailsCtrl = container.get<IDetailsCtrl>("IDetailsCtrl");
const dashboardCtrl = container.get<IDoctorDashboardCtrl>("IDoctorDashboardCtrl");
const payoutCtrl = container.get<IDoctorPayoutCtrl>("IDoctorPayoutCtrl");
const transactionCtrl = container.get<IDoctorTransactionController>("IDoctorTransactionController");




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



doctorRoutes.post(
  "/conversation",verifyIsPremiume(),
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
  "/message",verifyIsPremiume(),
  verifyAccessTokenMidleware("doctor"),
  (req, res) => messageCtrl.sendMessage(req, res)
);


doctorRoutes.post("/session",verifyIsPremiume(),verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.addSession(req,res));

doctorRoutes.get("/sessions",verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.getSessions(req,res) );

doctorRoutes.patch("/session",verifyIsPremiume(),verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.updateSession(req,res) );

doctorRoutes.delete("/session",verifyAccessTokenMidleware("doctor"),(req,res)=> sessionCtrl.deleteSession(req,res) );


doctorRoutes.get("/getAppointments",verifyIsPremiume(),verifyAccessTokenMidleware("doctor"),(req,res)=>appointmentCtrl.getAppointments(req,res))

doctorRoutes.patch("/cancelAppointment",verifyAccessTokenMidleware("doctor"),(req,res)=>appointmentCtrl.cancelAppointment(req,res))


doctorRoutes.get("/getAnalysisReports",verifyIsPremiume(), verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.getReports(req, res)) 

doctorRoutes.post("/submitAnalysisReports", verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.submitAnalysisReports(req, res));

doctorRoutes.post("/cancelAnalysisReports", verifyAccessTokenMidleware("doctor"), (req, res) =>
  ReportAnalysisCtrl.cancelAnalysisReports(req, res));

doctorRoutes.get("/getSubscriptions",verifyAccessTokenMidleware("doctor"),(req,res)=>planCtrl.getProducts(req,res))

doctorRoutes.get("/getBlogs",verifyAccessTokenMidleware("doctor"),(req,res)=>blogCtrl.getBlogs(req,res));

doctorRoutes.post("/blog",verifyAccessTokenMidleware("doctor"),(req,res)=>blogCtrl.createBlog(req,res));

doctorRoutes.put("/blog",verifyAccessTokenMidleware("doctor"),(req,res)=>blogCtrl.updateBlog(req,res));

doctorRoutes.post("/advertisement",verifyAccessTokenMidleware("doctor"),(req,res)=>addCtrl.createAdvertisement(req,res));

doctorRoutes.get("/advertisements",verifyAccessTokenMidleware("doctor"),(req,res)=>addCtrl.getAdds(req,res));

doctorRoutes.get("/notifications",verifyAccessTokenMidleware("doctor"),(req,res)=> notificationCtrl.getAllNotifications(req,res) )

doctorRoutes.get("/prescriptions",verifyAccessTokenMidleware("doctor"),(req,res)=> prescriptionsCtrl.getPrescriptions(req,res))

doctorRoutes.post("/prescription",verifyAccessTokenMidleware("doctor"),(req,res)=> prescriptionsCtrl.submitPrescription(req,res))

doctorRoutes.get("/getUser",verifyAccessTokenMidleware("doctor"),(req,res)=> detailsCtrl.getUser(req,res));

doctorRoutes.get("/dashboard",verifyAccessTokenMidleware("doctor"),(req,res)=> dashboardCtrl.getDashboardContent(req,res));

doctorRoutes.post("/requestPayout",verifyAccessTokenMidleware("doctor"),(req,res) => payoutCtrl.requestPayout(req,res))

doctorRoutes.get("/bookedSlots",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.getBookedSlots(req,res))

doctorRoutes.get("/getPayouts",verifyAccessTokenMidleware("doctor"),(req,res)=>payoutCtrl.getPayouts(req,res));

doctorRoutes.post("/unAvailableDays",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.makeDayUnavailable(req,res));

doctorRoutes.delete("/unAvailableDays",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.makeDayAvailable(req,res));

doctorRoutes.get("/unAvailableDays",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.getUnavailableDays(req,res));

doctorRoutes.post("/unAvailableSessions",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.unAvailableSessions(req,res));

doctorRoutes.delete("/unAvailableSessions",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.makeSessionsAvailable(req,res));

doctorRoutes.get("/unAvailableSessions",verifyAccessTokenMidleware("doctor"),(req,res)=>sessionCtrl.getUnavailablSessions(req,res));

doctorRoutes.get("/appointmentStats",verifyAccessTokenMidleware("doctor"),(req,res)=>dashboardCtrl.appointmentStats(req,res));

doctorRoutes.get("/reportsStats",verifyAccessTokenMidleware("doctor"),(req,res)=>dashboardCtrl.reportsStats(req,res));

doctorRoutes.get("/payoutsStats",verifyAccessTokenMidleware("doctor"),(req,res)=>dashboardCtrl.payoutsStats(req,res));

doctorRoutes.get("/getRevenues",verifyAccessTokenMidleware("doctor"),(req,res)=>transactionCtrl.getRevenues(req,res));




export default doctorRoutes;

