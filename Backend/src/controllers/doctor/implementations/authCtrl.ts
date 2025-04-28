import { NextFunction, Request, Response } from "express";
import IDoctorAuthCtrl from "../interfaces/IAuthCtrl";
import { inject, injectable } from "inversify";
import IDoctorAuthService from "../../../services/doctor/interfaces/IDoctorAuthServices";




@injectable()
export default class DoctorAuthController implements IDoctorAuthCtrl {
  private _doctorService: IDoctorAuthService;

  constructor(@inject("IDoctorAuthService") DoctorAuthService: IDoctorAuthService) {
    this._doctorService = DoctorAuthService;
  }

  async doctorLogin(req: Request, res:Response): Promise<any> {
    try {
      const { email, password } = req.body;

      const result = await this._doctorService.login(res, { email, password });

      console.log("result is ", result);

      if (!result) {
        return res.status(401).json({ msg: "Envalid credentials" });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Envalid credentials" });
    }
  };

}