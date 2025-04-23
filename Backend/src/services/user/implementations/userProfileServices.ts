import IUserProfileService from "../interfaces/IuserProfileServices"
import {IUser} from "../../../dto/userDTO"
import {inject , injectable} from "inversify"
import IUserRepository from "../../../repositories/interfaces/IUserRepository";


@injectable()
export default class UserProfileService implements IUserProfileService {
     constructor(@inject("IUserRepository") private _userRepository:IUserRepository){
    
        }

    async updateProfile(userId:string,userData: Partial<IUser> ): Promise<any> {
        
        console.log("user data is ",userData);
        console.log("user id from service ",userId);

        try {
            const updatedUser = await this._userRepository.update(userId, userData);
            console.log("Updated user: ", updatedUser);

            if(updatedUser){
                const { password, ...userWithoutPassword } = updatedUser.toObject();
      
            return {
            message: "updated successful",
            updatedUser: userWithoutPassword,
            };
           
            }

            
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw new Error("Failed to update user profile");
        }
    }
}
