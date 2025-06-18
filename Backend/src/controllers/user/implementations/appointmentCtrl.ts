import { Response,Request } from "express";
import IUserAppointmentController from "../interfaces/IAppointmentCtrl";
import { inject, injectable } from "inversify";
import IUserAppointmentService from "../../../services/user/interfaces/IUserAppointmentServices";


injectable();

export default class UserAppointmentController implements IUserAppointmentController {

    private _appointmentService: IUserAppointmentService;
    

    constructor(
        @inject("IUserAppointmentService") UserAppointmentService: IUserAppointmentService
    ) {
        this._appointmentService = UserAppointmentService;
    };


    async fetchingDoctors(req: Request, res: Response): Promise<any> {
  try {
    const { search = "", location = "", category = "", sort = "", page = "1", limit = "10" } = req.query;

    const doctors = await this._appointmentService.fetchingDoctors(
      String(search),
      String(location),
      String(category),
      String(sort),
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json(doctors);
  } catch (err) {
    console.error("Error in controller fetchingDoctors:", err);
    res.status(500).json({ message: "Server error" });
  }
};



async getAppointments (req: Request, res: Response): Promise<any> {

try{

  const userId = req.query.userId;

  console.log("user id is///",userId);

  const appointments = await this._appointmentService.getUserAppointments(String(userId));

    res.status(200).json(appointments);


}catch(err){
  console.error("Error in fetchin user appointments:", err);
  res.status(500).json({ message: "Server error" });
}

}


}