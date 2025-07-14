
import { inject,injectable } from "inversify";
import IUserSessionService from "../interfaces/IUserSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import {ISession} from "../../../dto/sessionDTO";
import { IAppointment } from "../../../dto/appointmentDTO";

@injectable()
export default class UserSessionService implements IUserSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentsRepository") private _appointmentRepository : IAppointmentsRepository,

    ){

    };


async getSessions (doctorId:string):Promise<ISession[]>{

    try{
        const response = await this._sessionRepository.findAll({doctorId:doctorId});
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}


async getBookedSlots (doctorId:string,formattedDate:string):Promise<IAppointment[]>{

    try{

        console.log("doctorId and formatted date is :" , doctorId,formattedDate);

        const response = await this._appointmentRepository.findAll({doctorId:doctorId,date:formattedDate});

        console.log("booked appointmets are:",response);
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}



};