import { IUser } from "../../../dto/userDTO";

export default interface IUserProfileService {

    updateProfile(userId:string,userData: Partial<IUser>): Promise<any>;
    updateUserDp(userId: string, updatedFields: any, file: Express.Multer.File | undefined):Promise<any>
}