import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/jwt";
import userModel from "../../models/user";
import { HttpStatusCode } from "../../utils/enum";

export function verifyAccessTokenMidleware(role: "user" | "admin" | "doctor") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | any> => {

    if (req.path.includes("/refreshToken")) return next();
    

    let token;
    if(role==="user"){
      const {userAccessToken} = req.cookies;

    // console.log("token is..... ",userAccessToken);

    token=userAccessToken;
    if (!userAccessToken) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Access token missing" });
    }
    }

    if(role==="admin"){
      const {adminAccessToken} = req.cookies;

    // console.log("token is..... ",adminAccessToken);

    token=adminAccessToken;
    if (!adminAccessToken) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Access token missing" });
    }
    }

    if(role==="doctor"){
      const {doctorAccessToken} = req.cookies;

    // console.log("token is..... ",doctorAccessToken);

    token=doctorAccessToken;
    if (!doctorAccessToken) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Access token missing" });
    }
    }
    

   

    try {
      const decoded = verifyAccessToken(token);

    // console.log("decoded is..... ",decoded);

    if(!decoded){
      return res.status(HttpStatusCode.UNAUTHORIZED).json({ msg: "Access token expired or invalid" });
      
    }
      if (decoded.role !== role) {
        return res.status(HttpStatusCode.FORBIDDEN).json({ msg: "Forbidden: Role mismatch" });

      }

  if(role==="user"){

       const user = await userModel.findById(decoded.id).select('isBlocked');
    if (!user) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, error: { message: 'User not found' } });
    }

    if (user.isBlocked) {
      return res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        error: { message: 'User is blocked. Please contact support.' }
      });
    }

  }

      next();
    } catch (err) {
      console.error("Access token error:", err);
      return res.status(HttpStatusCode.FORBIDDEN).json({ msg: "Forbidden: Role mismatch" });

    }
  };
}


export { verifyAccessToken };
