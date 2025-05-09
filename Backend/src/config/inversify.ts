import { Container } from "inversify";
import userModel from "../models/userModel";
import OtpModel from "../models/otpModel";
import adminModel from "../models/adminModel";
import doctorModel from "../models/doctorModel";

//controllers..................................................................
import UserAuthController from "../controllers/user/implementations/authCtrl";
import IUserAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";
import UserProfileController from "../controllers/user/implementations/profileCtrl";
import IUserProfileCtrl from "../controllers/user/interfaces/IProfileCtrl";

import AdminAuthController from "../controllers/admin/implementations/authCtrl";
import IAdminAuthCtrl from "../controllers/admin/interfaces/IAuthCtrl";
import AdminUserController from "../controllers/admin/implementations/userCtrl";
import IAdminUserCtrl from "../controllers/admin/interfaces/IUserCtrl";
import AdminDoctorController from "../controllers/admin/implementations/doctorCtrl";
import IAdminDoctorCtrl from "../controllers/admin/interfaces/IDoctorCtrl";


import DoctorAuthController from "../controllers/doctor/implementations/authCtrl";
import IDoctorAuthCtrl from "../controllers/doctor/interfaces/IAuthCtrl";
//.................................................................................

//services.....................................................................
import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";
import UserProfileService from "../services/user/implementations/userProfileServices";
import IUserProfileService from "../services/user/interfaces/IuserProfileServices";


import AdminAuthService from "../services/admin/implementations/adminAuthService";
import IAdminAuthService from "../services/admin/interfaces/IAdminAuthService";
import AdminUserService from "../services/admin/implementations/adminUserService";
import IAdminUserService from "../services/admin/interfaces/IAdminUserService";
import AdminDoctorService from "../services/admin/implementations/adminDoctorService";
import IAdminDoctorService from "../services/admin/interfaces/IAdminDoctorService";

import DoctorAuthService from "../services/doctor/implementations/doctorAuthServices";
import IDoctorAuthService from "../services/doctor/interfaces/IDoctorAuthServices";

//.................................................................................

//repositories......................................................................
import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";

import AdminRepository from "../repositories/implementations/adminRepository";
import IAdminRepository from "../repositories/interfaces/IAdminRepository";

import DoctorRepository from "../repositories/implementations/doctorRepository";
import IDoctorRepository from "../repositories/interfaces/IDoctorRepository";

//.................................................................................


const container = new Container();
//models.............................................................
container.bind("userModel").toConstantValue(userModel);
container.bind("otpModel").toConstantValue(OtpModel);
container.bind("adminModel").toConstantValue(adminModel);
container.bind("doctorModel").toConstantValue(doctorModel);
//...................................................................


container.bind<IUserAuthCtrl>("IUserAuthCtrl").to(UserAuthController);
container.bind<IUserProfileCtrl>("IUserProfileCtrl").to(UserProfileController);

container.bind<IAdminAuthCtrl>("IAdminAuthCtrl").to(AdminAuthController);
container.bind<IAdminUserCtrl>("IAdminUserCtrl").to(AdminUserController);
container.bind<IAdminDoctorCtrl>("IAdminDoctorCtrl").to(AdminDoctorController);

container.bind<IDoctorAuthCtrl>("IDoctorAuthCtrl").to(DoctorAuthController)





container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IUserProfileService>("IUserProfileService").to(UserProfileService);

container.bind<IAdminAuthService>("IAdminAuthService").to(AdminAuthService);
container.bind<IAdminUserService>("IAdminUserService").to(AdminUserService);
container.bind<IAdminDoctorService>("IAdminDoctorService").to(AdminDoctorService);

container.bind<IDoctorAuthService>("IDoctorAuthService").to(DoctorAuthService)





container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<IAdminRepository>("IAdminRepository").to(AdminRepository);
container.bind<IDoctorRepository>("IDoctorRepository").to(DoctorRepository)



export default container;