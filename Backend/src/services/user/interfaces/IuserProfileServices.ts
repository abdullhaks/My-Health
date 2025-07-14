import { IUser } from "../../../dto/userDTO";
import { IUserResponse } from "../../../dto/userDTO";


export default interface IUserProfileService {

    updateProfile(userId:string,userData: Partial<IUser>): Promise<Partial<IUserResponse>>;
    updateUserDp(userId: string, updatedFields: Partial<IUser>, fileKey: string | undefined): Promise<IUser> 
    changePassword(id:string,data:{
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;}):Promise<IUser>
}