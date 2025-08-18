import { NextFunction, Request, Response } from "express";
import IAdminUserCtrl from "../interfaces/IAdminUserCtrl";
import { inject, injectable } from "inversify";
import IAdminUserService from "../../../services/admin/interfaces/IAdminUserService";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class AdminUserController implements IAdminUserCtrl {


  constructor(
    @inject("IAdminUserService")   private _adminUserService: IAdminUserService
  ) { }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, search, limit } = req.query;
      console.log("reqest.params from get users...", search, page, limit);

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const result = await this._adminUserService.getUsers(
        pageNumber,
        search as string | undefined,
        limitNumber
      );

      if (!result) {
         res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "fetching users has been fialed " });
      }
       res.status(HttpStatusCode.OK).json(result);
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

      const result = this._adminUserService.block(id);

      console.log("resposne form user blocking ctrl..", result);

      if (!result) {
         res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "blocking users has been fialed " });
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

      console.log("user id for block...", id);

      const result = this._adminUserService.unblock(id);

      console.log("resposne form user blocking ctrl..", result);

      if (!result) {
         res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "blocking users has been fialed " });
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
