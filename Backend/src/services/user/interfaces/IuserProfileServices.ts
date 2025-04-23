import { IUser } from "../../../dto/userDTO";

export default interface IUserProfileService {

    updateProfile(userId:string,userData: Partial<IUser>): Promise<any>;

}