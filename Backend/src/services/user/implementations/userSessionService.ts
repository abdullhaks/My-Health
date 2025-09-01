
import { inject,injectable } from "inversify";
import IUserSessionService from "../interfaces/IUserSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import {ISession} from "../../../dto/sessionDTO";
import { IAppointment } from "../../../dto/appointmentDTO";
import IUnAvailableDayRepository from "../../../repositories/interfaces/IUnAvailableDayRepository";
import IUnAvailableSessionRepository from "../../../repositories/interfaces/IUnAvailableSessionRepository";

@injectable()
export default class UserSessionService implements IUserSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentsRepository") private _appointmentRepository : IAppointmentsRepository,
        @inject("IUnAvailableDayRepository") private _unAvailableDayRepository : IUnAvailableDayRepository,
        @inject("IUnAvailableSessionRepository") private _unAvailableSessionRepository : IUnAvailableSessionRepository,

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

        const response = await this._appointmentRepository.findAll({doctorId:doctorId,date:formattedDate,appointmentStatus:{ $in: ["booked", "completed"] },});

        console.log("booked appointmets are:",response);
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}



async getUnavailablSessions(doctorId:string):Promise<{ day: String; sessionId: string }[]>{
    try{
        console.log("doctorId and day from service....:", doctorId);
        let today = new Date();
        let yesteday = new Date(today.setDate(today.getDate() - 1));
        const dateObj = new Date(yesteday);
        const yyyy = dateObj.getUTCFullYear();
        const mm = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getUTCDate()).padStart(2, "0");
        const nDate = `${yyyy}-${mm}-${dd}`;
        
        const response = await this._unAvailableSessionRepository.findAll({doctorId:doctorId,day:{$gte:nDate}})

        let sessions = response.map((item)=> {
            let sess: { day: String; sessionId: string } = { day: item.day, sessionId: item.sessionId.toString() };
            return sess;
        });

        sessions.forEach((element) => {
            console.log(element);
        });
 
        return sessions;
    }catch(error){
        console.error("Error in getUnavailablSessions", error);
        throw new Error("Failed to get unavailable sessions");
    }
}



async getUnavailableDays(doctorId:string):Promise<String[]>{
    try{
        console.log("doctorId from service....:", doctorId);
        let today = new Date();
        let yesterday = new Date(today.setDate(today.getDate() - 1));
        console.log("yesterday  is....:", yesterday);

        let yesStr  = yesterday.toISOString().split("T")[0];
        console.log("yesStr  are....:", yesStr);

        const response = await this._unAvailableDayRepository.findAll({doctorId:doctorId,day:{$gte:yesStr}})

        let days = response.map(item => item.day)
        console.log("unavailable days are....:", days);
        return days;
    }catch(error){
        console.error("Error in makeDayUnavailable", error);
        throw new Error("Failed to make day unavailable");
    }
};






};