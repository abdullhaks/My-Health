
import { inject,injectable } from "inversify";
import IUserSessionService from "../interfaces/IUserSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";

@injectable()
export default class UserSessionService implements IUserSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentRepository") private _appointmentRepository : IAppointmentRepository,

    ){

    };


async getSessions (doctorId:string):Promise<any>{

    try{
        const response = await this._sessionRepository.findAll({doctorId:doctorId});
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}


async getBookedSlots (doctorId:string,formattedDate:string):Promise<any>{

    try{

        console.log("doctorId and formatted date is :" , doctorId,formattedDate);

        const response = await this._appointmentRepository.findAll({doctorId:doctorId,start:formattedDate});
        // return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}



};