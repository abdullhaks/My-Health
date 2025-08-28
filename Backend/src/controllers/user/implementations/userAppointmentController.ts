import { Response,Request } from "express";
import IUserAppointmentCtrl from "../interfaces/IUserAppointmentCtrl";
import { inject, injectable } from "inversify";
import IUserAppointmentService from "../../../services/user/interfaces/IUserAppointmentServices";
import { HttpStatusCode } from "../../../utils/enum";

interface AppointmentFilter {
  appointmentStatus?: string;
  startDate?: string;
  endDate?: string;
}

injectable();

export default class UserAppointmentController implements IUserAppointmentCtrl {


    
    
    constructor(
        @inject("IUserAppointmentService")  private _appointmentService: IUserAppointmentService
    ) { };


    async fetchingDoctors(req: Request, res: Response): Promise<void> {
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



async getAppointments (req: Request, res: Response): Promise<void> {

try{
  const { userId, page = "1", limit = "10", filter } = req.query;
  
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

  const response = await this._appointmentService.getUserAppointments(String(userId), Number(page),
        Number(limit),
        parsedFilter);

    res.status(HttpStatusCode.OK).json(response);


}catch(err){
  console.error("Error in fetchin user appointments:", err);
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
}

};


async cancelAppointment(req:Request, res: Response) : Promise <void> {

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

async walletPayment(req:Request, res: Response) : Promise<void>{

  try{
    const data  = req.body;
    console.log("data in backend is :.....",data);
    const response = await this._appointmentService.walletPayment(data);

     res.status(HttpStatusCode.CREATED).json({appointment:response});

  }catch(err){
    console.error("Error in wallet payment:", err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  };

};


async activeBooking(req:Request, res: Response) : Promise<void>{

  try{
  const {userId,doctorId} = req.query;
  console.log("data is ctrl",userId,doctorId);
  const response = await this._appointmentService.activeBooking(String(userId),String(doctorId));
  res.status(HttpStatusCode.OK).json(response);


  }catch(err){
    console.error("Error in active booking:", err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });

  }





};





}