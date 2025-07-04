import { Response,Request } from "express";
import IUserAppointmentController from "../interfaces/IAppointmentCtrl";
import { inject, injectable } from "inversify";
import IUserAppointmentService from "../../../services/user/interfaces/IUserAppointmentServices";
import { HttpStatusCode } from "../../../utils/enum";


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

    res.status(HttpStatusCode.OK).json(doctors);
  } catch (err) {
    console.error("Error in controller fetchingDoctors:", err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};



async getAppointments (req: Request, res: Response): Promise<any> {

try{

  const {userId,page,limit} = req.query

  console.log("user id is///",userId);

  const pageNumber = page ? parseInt(page as string, 10) : 1;
  const limitNumber = limit ? parseInt(limit as string, 10) : 10;

  const appointments = await this._appointmentService.getUserAppointments(String(userId), pageNumber, limitNumber);

    res.status(HttpStatusCode.OK).json(appointments);


}catch(err){
  console.error("Error in fetchin user appointments:", err);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
}

};


async cancelAppointment(req:Request, res: Response) : Promise <any> {

  try{

    console.log("appointment id is ctrl...",req.query.appointmentId);

    const appoinmentId = req.query.appointmentId;

    const response = await this._appointmentService.cancelAppointment(String(appoinmentId));

    res.status(HttpStatusCode.OK).json(response);

  }catch(err){
      console.error("Error in cancel appointments:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
}


}