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


  async doctorSignup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {

      const {
        fullName,
        email,
        password,
        graduation,
        category,
        registerNo,
      } = req.body;
  
  
      // Important: Parse nested fields manually
      // const parsedLocation = JSON.parse(location);
      const parsedSpecializations = [];
  
      let i = 0;
      while (req.body[`specializations[${i}][title]`]) {
        parsedSpecializations.push({
          title: req.body[`specializations[${i}][title]`],
          certificate:(req.files as unknown as { [key: string]: File[] })?.[`specializations[${i}][certificate]`]?.[0],
        });
        i++;
      }
  
      
  
      const doctor = {
        fullName,
        email,
        password,
        graduation,
        category,
        registerNo,
      }

      
      const registrationCertificate = (req.files as unknown as { [key: string]: File[] })?.registrationCertificate?.[0];
      const graduationCertificate = (req.files as unknown as { [key: string]: File[] })?.graduationCertificate?.[0];
      const verificationId = (req.files as unknown as { [key: string]: File[] })?.verificationId?.[0];
  
      const certificates = {
        registrationCertificate,
        graduationCertificate,
        verificationId
      }

      console.log("file are",registrationCertificate,graduationCertificate,verificationId)
      // Now you have everything properly parsed.
      // Save to DB or upload to S3 as needed
      const response = await this._doctorService.signup(doctor,certificates,parsedSpecializations)
  
      return res.status(201).json({ message: "Doctor signed up successfully!" });

      
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "internal server error" });
    }
  }

}