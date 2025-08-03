import { Response, Request } from "express";
import { inject, injectable } from "inversify";
import IDoctorAppointmentController from "../interfaces/IAppointmentCtrl";
import IDoctorAppointmentService from "../../../services/doctor/interfaces/IDoctorAppointmentService";
import { HttpStatusCode } from "../../../utils/enum";

interface AppointmentFilter {
  appointmentStatus?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class DoctorAppointmentController implements IDoctorAppointmentController {
  private _appointmentService: IDoctorAppointmentService;

  constructor(
    @inject("IDoctorAppointmentService") DoctorAppointmentService: IDoctorAppointmentService
  ) {
    this._appointmentService = DoctorAppointmentService;
  }

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, page = "1", limit = "10", filter } = req.query;

      // Parse and validate filter
      let parsedFilter: AppointmentFilter = {};
      if (typeof filter === "string") {
        try {
          const filterObj = JSON.parse(filter);
          parsedFilter = {
            appointmentStatus: typeof filterObj.appointmentStatus === "string" ? filterObj.appointmentStatus : undefined,
            startDate: typeof filterObj.startDate === "string" ? filterObj.startDate : undefined,
            endDate: typeof filterObj.endDate === "string" ? filterObj.endDate : undefined,
          };
        } catch (err) {
          console.error("Error parsing filter:", err);
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid filter format" });
          return;
        }
      } else if (typeof filter === "object" && filter !== null && !Array.isArray(filter)) {
        // If filter is already an object (unlikely with query params, but handling for completeness)
        parsedFilter = {
          appointmentStatus: typeof filter.appointmentStatus === "string" ? filter.appointmentStatus : undefined,
          startDate: typeof filter.startDate === "string" ? filter.startDate : undefined,
          endDate: typeof filter.endDate === "string" ? filter.endDate : undefined,
        };
      }

      console.log("Doctor ID is:", doctorId);
      const appointments = await this._appointmentService.getDoctorAppointments(
        String(doctorId),
        Number(page),
        Number(limit),
        parsedFilter
      );

      res.status(HttpStatusCode.OK).json(appointments);
    } catch (err) {
      console.error("Error fetching user appointments:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }
}