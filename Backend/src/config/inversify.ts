import { Container } from "inversify";
import userModel from "../models/userModel";


import AuthController from "../controllers/user/implementations/authCtrl";
import IAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";

import UserAuthService from "../services/user/implementations/userAuthServices";
import IUserAuthService from "../services/user/interfaces/IUserAuthServices";

import UserRepository from "../repositories/implementations/userRepository";
import IUserRepository from "../repositories/interfaces/IUserRepository";

const container = new Container();
container.bind("userModel").toConstantValue(userModel);

container.bind<IAuthCtrl>("IAuthCtrl").to(AuthController);
container.bind<IUserAuthService>("IUserAuthService").to(UserAuthService)
container.bind<IUserRepository>("IUserRepository").to(UserRepository);





export default container;