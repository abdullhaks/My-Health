import IUserAuthService from "../interfaces/IUserAuthServices";
import UserRepository from "../../../repositories/implementations/userRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IUser } from "../../../dto/userDTO";
import { inject, injectable } from "inversify";


@injectable()
export default class UserAuthService implements IUserAuthService {

    constructor(@inject("IUserRepository") private _userRepository:IUserRepository){

    }

    async signup(userData:IUser): Promise<any> {
        console.log("user data from service....",userData);

        const response = await this._userRepository.create(userData);

        console.log("response is ",response);

        return response;
    }
}