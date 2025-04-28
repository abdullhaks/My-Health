import IUserProfileService from "../interfaces/IuserProfileServices"
import {IUser} from "../../../dto/userDTO"
import {inject , injectable} from "inversify"
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import AWS from 'aws-sdk';
import path from "path"
import sharp from "sharp"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import bcrypt from "bcryptjs"
import UserRepository from "../../../repositories/implementations/userRepository";


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
      
                if(userWithoutPassword.profile){
                  userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
                }
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
    };

    async changePassword(id: string, data: any): Promise<any> {
      try {
        const existingUser = await this._userRepository.findOne({ _id: id });
        console.log("Existing user: ", existingUser);
    
        if (!existingUser) {
          throw new Error("Invalid credentials");
        }
    
        console.log(data.currentPassword === "ABDULLHa#786");
        console.log("current password is", data.currentPassword);
    
        // Corrected the argument order for bcrypt.compare
        const isPasswordValid = await bcrypt.compare(data.currentPassword, existingUser.password);
    
        console.log("bcrypt comparison is ", isPasswordValid);
    
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
    
        // Check if new password matches confirm password
        if (data.newPassword !== data.confirmPassword) {
          throw new Error("New password and confirm password do not match");
        }
    
        // Hash the new password and update it
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);
    
        console.log("after hashing newPassword is", hashedNewPassword);
    
        return await this._userRepository.update(existingUser._id.toString(), { password: hashedNewPassword });
    
      } catch (error) {
        console.error("profile service error:", error);
        throw new Error("Failed to change password");
      }
    }
    
    
    
}
