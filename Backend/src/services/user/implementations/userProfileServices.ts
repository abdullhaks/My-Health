import IUserProfileService from "../interfaces/IuserProfileServices"
import {IUser} from "../../../dto/userDTO"
import {inject , injectable} from "inversify"
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import AWS from 'aws-sdk';
import path from "path"
import sharp from "sharp"


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "ap-south-1", 
});

const s3 = new AWS.S3();

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



   

    async updateUserDp(userId: string, updatedFields: any, file: Express.Multer.File | undefined): Promise<any> {
        try {
          let imageUrl = "";
      
          if (file) {
            const jpegBuffer = await sharp(file.buffer)
            .jpeg({ quality: 90 }) // you can adjust quality here
            .toBuffer();
            const fileName = `users/profile-images/${userId}.jpeg`;
      
            const uploadParams = {
              Bucket: "myhealth-app-storage",
              Key: fileName,
              Body: jpegBuffer,
              ContentType: file.mimetype,
            };
      
            console.log("Uploading to S3 with params:", uploadParams);
            const uploadResult = await s3.upload(uploadParams).promise();
            console.log("S3 upload result:", uploadResult);
      
            imageUrl = uploadResult.Location;
          }
      
          const updatePayload = {
            ...updatedFields,
            ...(imageUrl && { profile: imageUrl }),
          };
      
          const updatedUser = await this._userRepository.update(userId, updatePayload);
          return updatedUser;
        } catch (error: any) {
          console.error("Service error:", error);
          throw new Error("Failed to update profile");
        }
      }
}
