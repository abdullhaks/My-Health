import { Request, Response, NextFunction ,RequestHandler} from "express";
import { HttpStatusCode } from "../../utils/enum";
import doctorModel from "../../models/doctor";

export function verifyIsPremiume():RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { doctorEmail } = req.cookies;

      if (!doctorEmail) {
         res .status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Credentials missing" });
         return
      }

      const doctor = await doctorModel.findOne({ email: doctorEmail });

      console.log("Doctor found for premium check:", doctorEmail, doctor);
      const isPremium = doctor?.premiumMembership || false;

      if (!isPremium) {
        // 🟢 Clear doctor cookies (logout effect)
        res.clearCookie("doctorAccessToken");
        res.clearCookie("doctorRefreshToken");
        res.clearCookie("doctorEmail");

         res.status(HttpStatusCode.FORBIDDEN).json({success: false,
          error: { message: "You are not a premium member. Logged out." },
        });
        return
      }

      next();
    } catch (err) {
      console.error("Premium verification error", err);

      res.clearCookie("doctorAccessToken");
      res.clearCookie("doctorRefreshToken");
      res.clearCookie("doctorEmail");

       res.status(HttpStatusCode.FORBIDDEN)
        .json({ msg: "Credentials mismatch. Logged out." });

        return
    }
  };
}
