import { Response,Request } from "express";
import IDoctorAppointmentController from "../interfaces/IAppointmentCtrl";
import { inject, injectable } from "inversify";
import IDoctorAppointmentService from "../../../services/doctor/interfaces/IDoctorAppointmentService";
import { HttpStatusCode } from "../../../utils/enum";


injectable();

export default class DoctorAppointmentController implements IDoctorAppointmentController {

    private _appointmentService: IDoctorAppointmentService;
    constructor(
        @inject("IDoctorAppointmentService") DoctorAppointmentService: IDoctorAppointmentService
    ) {
        this._appointmentService = DoctorAppointmentService;
    };

async getAppointments (req: Request, res: Response): Promise<void> {
try{
  const doctorId = req.query.doctorId;
  console.log("doctor id is///",doctorId);
  const appointments = await this._appointmentService.getDoctorAppointments(String(doctorId));
    res.status(HttpStatusCode.OK).json(appointments);

}catch(err){
  console.error("Error in fetchin user appointments:", err);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
}

}


}