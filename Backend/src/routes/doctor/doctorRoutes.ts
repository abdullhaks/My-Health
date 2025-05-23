import { Router } from "express";
import container from "../../config/inversify";
import IDoctorAuthCtrl from "../../controllers/doctor/interfaces/IAuthCtrl";
import IDoctorProfileCtrl from "../../controllers/doctor/interfaces/IProfileCtrl";
import IUserProfileCtrl from "../../controllers/user/interfaces/IProfileCtrl";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";
import IConversationCtrl from "../../controllers/common/interfaces/IConversationCtrl";
import IMessageCtrl from "../../controllers/common/interfaces/IMessageCtrl";

const doctorRoutes = Router();

const authCtrl = container.get<IDoctorAuthCtrl>("IDoctorAuthCtrl");
const profileCtrl = container.get<IDoctorProfileCtrl>("IDoctorProfileCtrl");
const conversationCtrl = container.get<IConversationCtrl>("IConversationCtrl");
const messageCtrl = container.get<IMessageCtrl>("IMessageCtrl")

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

// doctorRoutes.post(
//   "/message",
//   verifyAccessTokenMidleware("doctor"),
//   // uploadMiddleware.single("file"),
//   // uploadToS3("chat-files", true),
//   (req, res) => messageCtrl.sendMessage(req, res)
// );

export default doctorRoutes;

