import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../utils/jwt";

export function verifyAccessTokenMidleware(role: "user" | "admin" | "doctor") {
  return (req: Request, res: Response, next: NextFunction): void | any => {

    if (req.path.includes("/refreshToken")) return next();
    
    const {userAccessToken} = req.cookies;
    console.log("token is..... ",userAccessToken);

    if (!userAccessToken) {
      return res.status(401).json({ msg: "Access token missing" });
    }

   

    try {
      const decoded = verifyAccessToken(userAccessToken);

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
