import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function verifyAdminAccessToken (req: Request, res: Response, next: NextFunction):void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
     res.status(401).json({ msg: "Access token missing" });
     return
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    console.log("Decoded token: ", decoded);
    // (req as any).adminId = decoded.data;
    next();
  } catch (err) {
     res.status(401).json({ msg: "Invalid or expired token" });
     return
  }
};
