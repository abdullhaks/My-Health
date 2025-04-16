import { Container } from "inversify";
import userModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import adminModel from "../models/adminModel";


import AuthController from "../controllers/user/implementations/authCtrl";
import IAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";
import AdminAuthController from "../controllers/admin/implementations/authCtrl";
import IAdminAuthCtrl from "../controllers/admin/interfaces/IAuthCtrl";

import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";
import AdminAuthService from "../services/admin/implementations/adminAuthService";
import IAdminAuthService from "../services/admin/interfaces/IAdminAuthService";

import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";
import AdminRepository from "../repositories/implementations/adminRepository";
import IAdminRepository from "../repositories/interfaces/IAdminRepository";

const container = new Container();
container.bind("userModel").toConstantValue(userModel);
container.bind("otpModel").toConstantValue(OtpModel);
container.bind("adminModel").toConstantValue(adminModel);

container.bind<IAuthCtrl>("IAuthCtrl").to(AuthController);
container.bind<IAdminAuthCtrl>("IAdminAuthCtrl").to(AdminAuthController);

container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IAdminAuthService>("IAdminAuthService").to(AdminAuthService);

container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository);




export default container;