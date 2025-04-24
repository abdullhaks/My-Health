import { Container } from "inversify";
import userModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import adminModel from "../models/adminModel";

//controllers..................................................................
import UserAuthController from "../controllers/user/implementations/authCtrl";
import IUserAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";
import UserProfileController from "../controllers/user/implementations/profileCtrl";
import IUserProfileCtrl from "../controllers/user/interfaces/IProfileCtrl";

import AdminAuthController from "../controllers/admin/implementations/authCtrl";
import IAdminAuthCtrl from "../controllers/admin/interfaces/IAuthCtrl";
//.................................................................................

//services.....................................................................
import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";
import UserProfileService from "../services/user/implementations/userProfileServices";
import IUserProfileService from "../services/user/interfaces/IuserProfileServices";


import AdminAuthService from "../services/admin/implementations/adminAuthService";
import IAdminAuthService from "../services/admin/interfaces/IAdminAuthService";
//.................................................................................

//repositories......................................................................
import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";
import AdminRepository from "../repositories/implementations/adminRepository";
import IAdminRepository from "../repositories/interfaces/IAdminRepository";
//.................................................................................


const container = new Container();
//models.............................................................
container.bind("userModel").toConstantValue(userModel);
container.bind("otpModel").toConstantValue(OtpModel);
container.bind("adminModel").toConstantValue(adminModel);
//...................................................................


container.bind<IUserAuthCtrl>("IUserAuthCtrl").to(UserAuthController);
container.bind<IUserProfileCtrl>("IUserProfileCtrl").to(UserProfileController);

container.bind<IAdminAuthCtrl>("IAdminAuthCtrl").to(AdminAuthController);

container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IUserProfileService>("IUserProfileService").to(UserProfileService);

container.bind<IAdminAuthService>("IAdminAuthService").to(AdminAuthService);

container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository);




export default container;