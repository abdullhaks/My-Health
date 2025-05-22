import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();



const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string
const ACCESS_TOKEN_SECRET= process.env.ACCESS_TOKEN_SECRET as string

export const generateAccessToken = (data: { id: string; role: "user" | "admin" | "doctor" }): string => {
    
    
    return jwt.sign(
        { id: data.id, role: data.role }, 
        ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
    );
};

export const generateRefreshToken = (data: { id: string; role: "user" | "admin" | "doctor" }): string => {
    

    return jwt.sign(
        { id: data.id, role: data.role },  
        REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        const decoded=jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload; 

        return decoded;
    } catch {
        return null;
    }
};


export const verifyAccessToken = (token: string): JwtPayload | null => {
    try {
        console.log("token is...sforfksdjflds",token)
        const decoded= jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload; 
        console.log("decoded is...sforfksdjflds",decoded)
        return decoded;

    } catch {
        return null;
    }
};