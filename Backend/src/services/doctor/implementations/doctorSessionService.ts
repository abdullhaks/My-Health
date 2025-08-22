
import { inject,injectable } from "inversify";
import IDoctorSessionService from "../interfaces/IDoctorSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import {ISession} from "../../../dto/sessionDTO"
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IUnAvailableDayRepository from "../../../repositories/interfaces/IUnAvailableDayRepository";
import { IAppointment } from "../../../dto/appointmentDTO";



@injectable()
export default class DoctorSessionService implements IDoctorSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentsRepository") private _appointmentRepository : IAppointmentsRepository,
        @inject("IUnAvailableDayRepository") private _unAvailableDayRepository : IUnAvailableDayRepository,
        

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


async deleteSession (sessionId:string):Promise<any>{
    try{
        console.log("sessionId is :", sessionId);

        let cancelledAppoitments: { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }[] = []
        let existingAppointment = await this._appointmentRepository.findAll({sessionId: sessionId,
            start:{$gte:new Date()}});
 
            console.log("existing appointment is :", existingAppointment);
            if(existingAppointment){
                console.log("existing appointment found, deleting it");
                await this._appointmentRepository.updateMany({sessionId: sessionId,start:{$gte:new Date()}},{$set:{appointmentStatus:"cancelled"}});
                existingAppointment.forEach((appointment: IAppointment) => {
                    cancelledAppoitments.push({
                        appointmentId: (appointment._id as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
                }
            )
            
            }


        await this._sessionRepository.delete(sessionId);



        return cancelledAppoitments;
    }catch(error){
        console.error("Error in delete session", error);
        throw new Error("Failed to delete consultation session");
    }   

};




async updateSession(sessionId: string, editingSession: any): Promise<any> {
    try {
        console.log("sessionId and editing session is :", sessionId, editingSession);
        const updatedSession = await this._sessionRepository.update(sessionId, editingSession);
        if (!updatedSession) {
            throw new Error("Session not found or could not be updated");
        };

        let cancelledAppoitments: { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }[] = []
        let existingAppointment = await this._appointmentRepository.findAll({sessionId: sessionId,
            start:{$gte:new Date()}});

            if(existingAppointment){
                console.log("existing appointment found, deleting it");
                await this._appointmentRepository.updateMany({sessionId: sessionId,start:{$gte:new Date()}},{$set:{appointmentStatus:"cancelled"}});
                existingAppointment.forEach((appointment: IAppointment) => {
                    cancelledAppoitments.push({
                        appointmentId: (appointment._id as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
                }
            )
            
            }

        console.log("cancelled appointments are :", cancelledAppoitments);
       
        return {updatedSession,cancelledAppoitments};

       
    } catch (error) {
        console.error("Error in updateSession:", error);
        throw new Error("Failed to update consultation session");
    }

};


async makeDayUnavailable(doctorId:string,day:Date):Promise<any>{
    try{
        console.log("doctorId and day is frim service....:", doctorId,day);

        const response = await this._unAvailableDayRepository.create({doctorId,day})

        return response;
    }catch(error){
        console.error("Error in makeDayUnavailable", error);
        throw new Error("Failed to make day unavailable");
    }
};



async getUnavailableDays(doctorId:string):Promise<any>{
    try{
        console.log("doctorId from service....:", doctorId);
        let today = new Date();
        let yesteday = new Date(today.setDate(today.getDate() - 1));

        const response = await this._unAvailableDayRepository.findAll({doctorId:doctorId,day:{$gte:yesteday}})

        let days = response.map(item => item.day)
        console.log("unavailable days are....:", days);
        return days;
    }catch(error){
        console.error("Error in makeDayUnavailable", error);
        throw new Error("Failed to make day unavailable");
    }
}

}