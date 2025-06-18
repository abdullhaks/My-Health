import { Response,Request } from "express";
import IDoctorAppointmentController from "../interfaces/IAppointmentCtrl";
import { inject, injectable } from "inversify";
import IDoctorAppointmentService from "../../../services/doctor/interfaces/IDoctorAppointmentService";


injectable();

export default class DoctorAppointmentController implements IDoctorAppointmentController {

    private _appointmentService: IDoctorAppointmentService;
    constructor(
        @inject("IDoctorAppointmentService") DoctorAppointmentService: IDoctorAppointmentService
    ) {
        this._appointmentService = DoctorAppointmentService;
    };

async getAppointments (req: Request, res: Response): Promise<any> {
try{
  const doctorId = req.query.doctorId;
  console.log("doctor id is///",doctorId);
  const appointments = await this._appointmentService.getDoctorAppointments(String(doctorId));
    res.status(200).json(appointments);

}catch(err){
  console.error("Error in fetchin user appointments:", err);
  res.status(500).json({ message: "Server error" });
}

}


}