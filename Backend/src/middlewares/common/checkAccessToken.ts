import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/jwt";

export function verifyAccessTokenMidleware(role: "user" | "admin" | "doctor") {
  return (req: Request, res: Response, next: NextFunction): void | any => {

    if (req.path.includes("/refreshToken")) return next();
    

    let token;
    if(role==="user"){
      const {userAccessToken} = req.cookies;
    console.log("token is..... ",userAccessToken);
    token=userAccessToken;
    if (!userAccessToken) {
      return res.status(401).json({ msg: "Access token missing" });
    }
    }

    if(role==="admin"){
      const {adminAccessToken} = req.cookies;
    console.log("token is..... ",adminAccessToken);
    token=adminAccessToken;
    if (!adminAccessToken) {
      return res.status(401).json({ msg: "Access token missing" });
    }
    }

    if(role==="doctor"){
      const {doctorAccessToken} = req.cookies;
    console.log("token is..... ",doctorAccessToken);
    token=doctorAccessToken;
    if (!doctorAccessToken) {
      return res.status(401).json({ msg: "Access token missing" });
    }
    }
    

   

    try {
      const decoded = verifyAccessToken(token);

    console.log("decoded is..... ",decoded);

    if(!decoded){
      return res.status(401).json({ msg: "Access token expired or invalid" });
      
    }
      if (decoded.role !== role) {
        return res.status(403).json({ msg: "Forbidden: Role mismatch" });

      }

      next();
    } catch (err) {
      console.error("Access token error:", err);
      return res.status(403).json({ msg: "Forbidden: Role mismatch" });

    }
  };
}

// 👇 This line solves your TS error
export { verifyAccessToken };
