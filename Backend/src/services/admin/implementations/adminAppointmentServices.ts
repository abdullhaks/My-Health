// import { inject , injectable } from "inversify";
// import IAdminAppointmentsService from "../interfaces/IAdminAppointmentServices";
// import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";


// @injectable()
// export default class UserAppointmentService implements IAdminAppointmentsService {

//     constructor(
     
//       @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
      
//     ){


//     }




// async getAppointments(pageNumber:number, limitNumber:number):Promise<any>{


//   const appointments = await this._appointmentsRepository.getAppointments(pageNumber,limitNumber);
//   console.log("appointments from service...",appointments);


//   return appointments;

// };

// }
