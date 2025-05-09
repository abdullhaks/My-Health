import { Router } from "express";
import container from "../../config/inversify";
import IDoctorAuthCtrl from "../../controllers/doctor/interfaces/IAuthCtrl";
import IDoctorProfileCtrl from "../../controllers/doctor/interfaces/IProfileCtrl";
import IUserProfileCtrl from "../../controllers/user/interfaces/IProfileCtrl";
import { upload, uploadToS3 } from "../../middlewares/common/uploadS3";
import { verifyAccessTokenMidleware } from "../../middlewares/common/checkAccessToken";



const doctorRoutes = Router();

const authCtrl = container.get<IDoctorAuthCtrl>("IDoctorAuthCtrl");
const profileCtrl = container.get<IDoctorProfileCtrl>("IDoctorProfileCtrl");

doctorRoutes.post("/login",(req,res)=>authCtrl.doctorLogin(req,res));

// doctorRoutes.post("/logout",(req,res)=>authCtrl.doctorLogout(req,res))

doctorRoutes.post("/signup",
    upload.fields([
        { name: "registrationCertificate", maxCount: 1 },
        { name: "graduationCertificate", maxCount: 1 },
        { name: "verificationId", maxCount: 1 },
        { name: "specializations[0][certificate]", maxCount: 1 },
      ]),
      (req,res)=>authCtrl.doctorSignup(req,res));

// doctorRoutes.post("/refreshToken",(req,res)=>authCtrl.refreshToken(req,res));

doctorRoutes.post("/verifyOtp",(req,res)=>authCtrl.verifyOtp(req,res));

doctorRoutes.get("/resentOtp",(req,res)=>authCtrl.resentOtp(req,res));

// doctorRoutes.get("/forgotPassword",(req,res)=>authCtrl.forgotPassword(req,res));

// doctorRoutes.get("/recoveryPassword",(req,res)=>authCtrl.getRecoveryPassword(req,res));

// doctorRoutes.post("/verifyRecoveryPassword",(req,res)=>authCtrl.verifyRecoveryPassword(req,res));

// doctorRoutes.patch("/resetPassword/:email",(req,res)=>authCtrl.resetPassword(req,res));

// doctorRoutes.patch("/changePassword/:id",(req,res)=>profileCtrl.changePassword(req,res))

// doctorRoutes.patch("/updateProfile/:id",verifyAccessTokenMidleware("doctor"),( req,res)=>profileCtrl.updateProfile(req,res));

// doctorRoutes.patch("/updateDp/:id" ,verifyAccessTokenMidleware("doctor"), upload.single("profile"),
// uploadToS3("doctors/profile-images",true), (req,res)=>profileCtrl.updateDp(req,res));


// doctorRoutes.get("/google", authCtrl.googleLoginRedirect); 
// doctorRoutes.get("/google/callback", authCtrl.googleCallback); 

doctorRoutes.post("/stripe/create-checkout-session", profileCtrl.createCheckoutSession); 


// doctorRoutes.get("/me", authCtrl.getMe.bind(authCtrl));







export default doctorRoutes; 