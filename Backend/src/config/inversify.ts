import { Container } from "inversify";

import AuthController from "../controllers/user/implementations/authCtrl";
import IAuthCtrl from "../controllers/user/interfaces/IAuthCtrl";


const container = new Container();

container.bind<IAuthCtrl>("IAuthCtrl").to(AuthController)



export default container;