import { NextFunction, Request, Response } from "express";
import IAdminDoctorCtrl from "../interfaces/IAdminDoctorCtrl";
import { inject, injectable } from "inversify";
import IAdminDoctorService from "../../../services/admin/interfaces/IAdminDoctorService";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class AdminDoctorController implements IAdminDoctorCtrl {


  constructor(
    @inject("IAdminDoctorService")  private _adminDoctorService: IAdminDoctorService
  ) { }

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const { page, search, limit, onlyPremium } = req.query;
      console.log("reqest.params from get users...", search, page, limit);

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;
      const onlyPremiumBool = onlyPremium === "true" ? true : false;

      const result = await this._adminDoctorService.getDoctors(
        pageNumber,
        search as string | undefined,
        limitNumber,
        onlyPremiumBool
      );

      if (!result) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "fetching doctors has been fialed " });
      }
       res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }

  async getDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const response = await this._adminDoctorService.getDoctor(id);

      if (!response) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "fetching doctor has been fialed " });
      }

       res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }

  async verifyDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const response = await this._adminDoctorService.verifyDoctor(id);
      if (!response) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "verifying doctor has been failed " });
      }

       res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }

  async declineDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      console.log("reson is..........", reason);
      const response = await this._adminDoctorService.declineDoctor(id, reason);
      if (!response) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "declining doctor has been failed " });
      }

       res.status(HttpStatusCode.OK).json(response);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }

  async block(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log("user id for block...", id);

      const result = this._adminDoctorService.block(id);

      console.log("resposne form doctor blocking ctrl..", result);

      if (!result) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "blocking doctors has been fialed " });
      }
       res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }

  async unblock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log("doctor id for block...", id);

      const result = this._adminDoctorService.unblock(id);

      console.log("resposne form doctor blocking ctrl..", result);

      if (!result) {
         res
          .status(HttpStatusCode.BAD_REQUEST)
          .json({ msg: "blocking doctors has been fialed " });
      }
       res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.log(error);
       res
        .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
        .json({ msg: "Envalid credentials" });
    }
  }
}
