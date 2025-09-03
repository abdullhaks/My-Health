import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../../utils/enum";
import doctorModel from "../../models/doctor";

export function verifyIsPremiume() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | any> => {
    try {
      const { doctorEmail } = req.cookies;

      if (!doctorEmail) {
        return res
          .status(HttpStatusCode.UNAUTHORIZED)
          .json({ msg: "Credentials missing" });
      }

      const doctor = await doctorModel.findOne({ email: doctorEmail });

      console.log("Doctor found for premium check:", doctorEmail, doctor);
      const isPremium = doctor?.premiumMembership || false;

      if (!isPremium) {
        // 🟢 Clear doctor cookies (logout effect)
        res.clearCookie("doctorAccessToken");
        res.clearCookie("doctorRefreshToken");
        res.clearCookie("doctorEmail");

        return res.status(HttpStatusCode.FORBIDDEN).json({
          success: false,
          error: { message: "You are not a premium member. Logged out." },
        });
      }

      next();
    } catch (err) {
      console.error("Premium verification error", err);

      res.clearCookie("doctorAccessToken");
      res.clearCookie("doctorRefreshToken");
      res.clearCookie("doctorEmail");

      return res
        .status(HttpStatusCode.FORBIDDEN)
        .json({ msg: "Credentials mismatch. Logged out." });
    }
  };
}
