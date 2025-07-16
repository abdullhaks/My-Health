import { Response,Request } from "express";
import IAdminAppointmentController from "../interfaces/IAppointmentCtrl";
import { inject, injectable } from "inversify";
import IAdminAppointmentService from "../../../services/admin/interfaces/IAdminAppointmentServices";
import { HttpStatusCode } from "../../../utils/enum";



injectable()

export default class AdminAppointmentController implements IAdminAppointmentController {

    private _appointmentService: IAdminAppointmentService;

    constructor(
        @inject("IAdminAppointmentsService") AdminAppointmentService: IAdminAppointmentService
    ) {
        this._appointmentService = AdminAppointmentService;
    };

 async getAppointments(req: Request, res: Response): Promise<any> {
    try {
      const { page, limit, status, doctorCategory, startDate, endDate } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        status: status as string,
        doctorCategory: doctorCategory as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const appointments = await this._appointmentService.getAppointments(pageNumber, limitNumber, filters);

      res.status(HttpStatusCode.OK).json(appointments);
    } catch (err) {
      console.error("Error in fetching user appointments:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }

};



