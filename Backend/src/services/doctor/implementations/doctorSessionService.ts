
import { inject,injectable } from "inversify";
import IDoctorSessionService from "../interfaces/IDoctorSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import {ISession} from "../../../dto/sessionDTO"
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment } from "../../../dto/appointmentDTO";



@injectable()
export default class DoctorSessionService implements IDoctorSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentsRepository") private _appointmentRepository : IAppointmentsRepository,
        

    ){

    };


   async addSessions(sessionData: ISession[]): Promise<ISession[]> {
    console.log("session data from service ", sessionData);
    try {

        await this._sessionRepository.deleteAll({doctorId:sessionData[0].doctorId.toString()})
        const response = await Promise.all(
            sessionData.map(async (data: any) => {
                const result = await this._sessionRepository.create(data);
                return result;
            })
        );

        console.log("response from service is :", response);
        return response;
    } catch (error) {
        console.error("Error in store sessions", error);
        throw new Error("Failed to store consultation sessions");
    }
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