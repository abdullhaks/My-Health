import { Response,Request } from "express";
import IUserProfileCtrl from "../interfaces/IUserProfileCtrl";
import { inject, injectable } from "inversify";
import IUserProfileService from "../../../services/user/interfaces/IuserProfileServices";
import { HttpStatusCode } from "../../../utils/enum";

injectable();

export default class UserProfileController implements IUserProfileCtrl {



    constructor(
        @inject("IUserProfileService") private _profileService: IUserProfileService
    ) { };


    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
           console.log("user data is ",req.body);
           console.log("user id is ",req.params.id);

            const userData = req.body;
            const dobStr = new Date(userData.dob).toLocaleDateString();
 
            const [month, day, year] = dobStr.split("/");
            userData.dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

            const userId = req.params.id;
            const result = await this._profileService.updateProfile(userId,userData);

             res.status(HttpStatusCode.OK).json(result);
        }catch (error) {
            console.log(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "internal server error" });
        }

    };


    async updateDp (req:Request,res:Response):Promise<void> {

        try{
            const { id } = req.params;
            const updatedFields = req.body;
            const uploadedImageKey = req.body.uploadedImageKey

            console.log("USER ID IS ",req.params,id);
            console.log("updatedField is ",updatedFields);
            console.log("uploadedImageKey is ",uploadedImageKey);

            const updatedUser = await this._profileService.updateUserDp(id, updatedFields, uploadedImageKey);

            res.status(HttpStatusCode.OK).json({updatedUser});

    
        }catch(error){
            console.log(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "internal server error" });
        }
    

    };


    async changePassword(req:Request,res:Response):Promise<void>{

        try{
            const {id} = req.params;
            const data = req.body.data;

            console.log("id and data is ",id,data);
            const response = await this._profileService.changePassword(id,data);

            if(!response){
             res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "password changing has been failed" });
             return
            };

             res.status(HttpStatusCode.OK).json({msg:"password changed"})

        }catch(error){
            console.log(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "internal server error" });
        }

    }

}