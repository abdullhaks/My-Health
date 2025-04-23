import { Response,Request } from "express";
import IProfileCtrl from "../interfaces/IprofileCtrl";
import { inject, injectable } from "inversify";
import IUserProfileService from "../../../services/user/interfaces/IuserProfileServices";


injectable();

export default class UserProfileController implements IProfileCtrl {

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
            const userId = req.params.id;
            const result = await this._profileService.updateProfile(userId,userData);

            return res.status(200).json(result);
        }catch (error) {
            console.log(error);
            res.status(500).json({ msg: "internal server error" });
        }

    }

}