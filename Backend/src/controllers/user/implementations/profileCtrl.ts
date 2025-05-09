import { Response,Request } from "express";
import IUserProfileCtrl from "../interfaces/IProfileCtrl";
import { inject, injectable } from "inversify";
import IUserProfileService from "../../../services/user/interfaces/IuserProfileServices";


injectable();

export default class UserProfileController implements IUserProfileCtrl {

    private _profileService: IUserProfileService;

    constructor(
        @inject("IUserProfileService") UserProfileService: IUserProfileService
    ) {
        this._profileService = UserProfileService;
    };


    async updateProfile(req: Request, res: Response): Promise<any> {
        try {
           console.log("user data is ",req.body);
           console.log("user id is ",req.params.id);

            const userData = req.body;
            const dobStr = new Date(userData.dob).toLocaleDateString();

            const [month, day, year] = dobStr.split("/");
            userData.dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

            const userId = req.params.id;
            const result = await this._profileService.updateProfile(userId,userData);

            return res.status(200).json(result);
        }catch (error) {
            console.log(error);
            res.status(500).json({ msg: "internal server error" });
        }

    };


    async updateDp (req:Request,res:Response):Promise<any> {

        try{
            const { id } = req.params;
            const updatedFields = req.body;
            const uploadedImageKey = req.body.uploadedImageKey

            console.log("USER ID IS ",req.params,id);
            console.log("updatedField is ",updatedFields);
            console.log("uploadedImageKey is ",uploadedImageKey);

            const updatedUser = await this._profileService.updateUserDp(id, updatedFields, uploadedImageKey);

            res.status(200).json({updatedUser});

    
        }catch(error){
            console.log(error);
            res.status(500).json({ msg: "internal server error" });
        }
    

    };


    async changePassword(req:Request,res:Response):Promise<any>{

        try{
            const {id} = req.params;
            const data = req.body.data;

            console.log("id and data is ",id,data);
            const response = await this._profileService.changePassword(id,data);

            if(!response){
            return res.status(403).json({ msg: "password changing has been failed" });
            };

            return res.status(200).json({msg:"password changed"})

        }catch(error){
            console.log(error);
            res.status(500).json({ msg: "internal server error" });
        }

    }

}