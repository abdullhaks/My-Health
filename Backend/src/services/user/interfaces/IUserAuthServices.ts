import { IUser } from "../../../dto/userDTO"

export default interface IUserAuthService {

    signup(userData:Partial<IUser>):Promise<any>
}