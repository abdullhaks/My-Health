import { Router } from "express";
import container from "../../config/inversify";
import IAuthCtrl from "../../controllers/user/interfaces/IAuthCtrl";

const userRoutes = Router();

const authCtrl = container.get<IAuthCtrl>("IAuthCtrl");

userRoutes.post("/login",(req,res)=>authCtrl.userLogin(req,res));

export default userRoutes; 