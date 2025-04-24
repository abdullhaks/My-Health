import IUserProfileService from "../interfaces/IuserProfileServices"
import {IUser} from "../../../dto/userDTO"
import {inject , injectable} from "inversify"
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import AWS from 'aws-sdk';
import path from "path"
import sharp from "sharp"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";


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
    };



   

    async updateUserDp(userId: string, updatedFields: any, fileKey: string | undefined): Promise<any> {
      try {
        const updatePayload = {
          ...updatedFields,
          ...(fileKey && { profile: fileKey }),
        };
    
        const updatedUser = await this._userRepository.update(userId, updatePayload);

        if(updatedUser){
          updatedUser.profile = await getSignedImageURL(updatedUser.profile)
        }
        
        return updatedUser;
      } catch (error: any) {
        console.error("Service error:", error);
        throw new Error("Failed to update profile");
      }
    }
    
}
