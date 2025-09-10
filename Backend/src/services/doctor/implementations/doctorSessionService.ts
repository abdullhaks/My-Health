
import { inject,injectable } from "inversify";
import IDoctorSessionService from "../interfaces/IDoctorSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";
import {ISession, ISessionDocument} from "../../../dto/sessionDTO"
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IUnAvailableDayRepository from "../../../repositories/interfaces/IUnAvailableDayRepository";
import IUnAvailableSessionRepository from "../../../repositories/interfaces/IUnAvailableSessionRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUnAvailableDayDocument } from "../../../entities/unAvailableDayEntities";
import { IUnAvailableSessionDocument } from "../../../entities/unAvailableSessionEntities";

interface cancelledSessions  { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }


@injectable()
export default class DoctorSessionService implements IDoctorSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
        @inject("IAppointmentsRepository") private _appointmentRepository : IAppointmentsRepository,
        @inject("IUnAvailableDayRepository") private _unAvailableDayRepository : IUnAvailableDayRepository,
        @inject("IUnAvailableSessionRepository") private _unAvailableSessionRepository : IUnAvailableSessionRepository,
        @inject("IUserRepository") private _userRepository : IUserRepository,
        @inject("ITransactionRepository") private _transactionRepository : ITransactionRepository,

    ){

    };


   async addSession(sessionData: ISession): Promise<ISession> {
    console.log("session data from service ", sessionData);
    try {


        const result = await this._sessionRepository.create(sessionData);
        return result;

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


async getBookedSlots (doctorId:string,formattedDate:string):Promise<string[]>{

    try{

        console.log("doctorId and formatted date is :" , doctorId,formattedDate);

        const response = await this._appointmentRepository.findAll({doctorId:doctorId,date:formattedDate,appointmentStatus:{ $in: ["booked", "completed"] },});

        let slots = []
        slots =  response.map((item) => item.slotId);
        console.log("booked appointmets are......//:",slots);
        return slots;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}


async deleteSession (sessionId:string):Promise<Partial<IAppointmentDTO>[]|null>{
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
                        appointmentId: (appointment._id as unknown as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
                }
            )
            
            };


        await Promise.all(existingAppointment.map(async (appointment) => {
        await this._userRepository.update(appointment.userId, {
          $inc: { walletBalance: appointment.fee },
        });
        // Optionally update analytics here if needed
        await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: appointment.fee,
          paymentFor: "refund",
          userId: appointment.userId,
          doctorId: appointment.doctorId
        });
      }));


        await this._sessionRepository.delete(sessionId);



        return cancelledAppoitments;
    }catch(error){
        console.error("Error in delete session", error);
        throw new Error("Failed to delete consultation session");
    }   

};




async updateSession(sessionId: string, editingSession: Partial<ISession>): Promise<{updatedSession:ISessionDocument|null,cancelledAppoitments:cancelledSessions[]|[]}> {
    try {
        console.log("sessionId and editing session is :", sessionId, editingSession);
        const updatedSession = await this._sessionRepository.update(sessionId, editingSession);
        if (!updatedSession) {
            throw new Error("Session not found or could not be updated");
        };

        let cancelledAppoitments: cancelledSessions[] = []
        let existingAppointment = await this._appointmentRepository.findAll({sessionId: sessionId,
            start:{$gte:new Date()}});

            if(existingAppointment){
                console.log("existing appointment found, deleting it");
                await this._appointmentRepository.updateMany({sessionId: sessionId,start:{$gte:new Date()}},{$set:{appointmentStatus:"cancelled"}});
                existingAppointment.forEach((appointment: IAppointment) => {
                    cancelledAppoitments.push({
                        appointmentId: (appointment._id as unknown as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
                }
            )
            
            }

            
        await Promise.all(existingAppointment.map(async (appointment) => {
        await this._userRepository.update(appointment.userId, {
          $inc: { walletBalance: appointment.fee },
        });
        // Optionally update analytics here if needed
        await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: appointment.fee,
          paymentFor: "refund",
          userId: appointment.userId,
          doctorId: appointment.doctorId
        });
      }));
            

        console.log("cancelled appointments are :", cancelledAppoitments);
       
        return {updatedSession,cancelledAppoitments};

       
    } catch (error) {
        console.error("Error in updateSession:", error);
        throw new Error("Failed to update consultation session");
    }

};


async makeDayUnavailable(doctorId:string,day:Date):Promise<{unavailableDay:IUnAvailableDayDocument|null,cancelledAppoitments:cancelledSessions[]|[]}>{
    try{
      console.log("doctorId and day is frim service....:", doctorId,day);

      let cancelledAppoitments: { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }[] = []

      let dateOnly = new Date(day);
      const yyyy = dateOnly.getFullYear();
      const mm = String(dateOnly.getMonth() + 1).padStart(2, "0");
      const dd = String(dateOnly.getDate()).padStart(2, "0");
      let localDate = `${yyyy}-${mm}-${dd}`;

      const expiredAppointments = await this._appointmentRepository.findAll({
        doctorId: doctorId,
        appointmentStatus: "booked",
        date:localDate 
        });


    // Then, update their status
    if (expiredAppointments && expiredAppointments.length > 0) {
      await this._appointmentRepository.updateMany(
        { doctorId: doctorId, appointmentStatus: "booked", date:localDate  },
        { appointmentStatus: "cancelled", paymentStatus: "refunded" }
      );

      await Promise.all(expiredAppointments.map(async (appointment) => {
        await this._userRepository.update(appointment.userId, {
          $inc: { walletBalance: appointment.fee },
        });
        // Optionally update analytics here if needed
        await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: appointment.fee,
          paymentFor: "refund",
          userId: appointment.userId,
          doctorId: appointment.doctorId
        });

        cancelledAppoitments.push({
                        appointmentId: (appointment._id as unknown as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
      }));

     


    }

    const nDate = day.toString().split("T")[0];

    console.log("nDate is",nDate);

    
    const unavailableDay = await this._unAvailableDayRepository.create({doctorId:doctorId,day:localDate});



        return {unavailableDay,cancelledAppoitments};
    }catch(error){
        console.error("Error in makeDayUnavailable", error);
        throw new Error("Failed to make day unavailable");
    }
};

async makeDayAvailable(doctorId: string, day: Date): Promise<IUnAvailableDayDocument|null> {
    
    console.log("day for available day.....", day);
    // Convert to local date string "YYYY-MM-DD"
    const dateObj = new Date(day);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const nDate = `${yyyy}-${mm}-${dd}`;
    console.log("nDate is", nDate);
    const reponse = await this._unAvailableDayRepository.findOne({doctorId:doctorId, day:nDate});
    if(reponse){
        const result = await this._unAvailableDayRepository.delete(reponse._id.toString());
        return result;
    }
    throw new Error("No unavailable day found to make available");
}

async getUnavailableDays(doctorId:string):Promise<String[]|null>{
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




async unAvailableSessions(doctorId:string,day:Date, sessionId:string):Promise<{unAvailableSessions:IUnAvailableSessionDocument|null,cancelledAppoitments:cancelledSessions[]|null}>{
    try{
      console.log("doctorId, date and slotId from service....:", doctorId,day, sessionId);
      let dateOnly = new Date(day);
      const yyyy = dateOnly.getFullYear();
      const mm = String(dateOnly.getMonth() + 1).padStart(2, "0");
      const dd = String(dateOnly.getDate()).padStart(2, "0");
      let localDate = `${yyyy}-${mm}-${dd}`;

      let cancelledAppoitments: { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }[] = []

      const expiredAppointments = await this._appointmentRepository.findAll({
        doctorId: doctorId,
        appointmentStatus: "booked",
        date:localDate,
        sessionId:sessionId 
        });

        if (expiredAppointments && expiredAppointments.length > 0) {
      await this._appointmentRepository.updateMany(
        { doctorId: doctorId, appointmentStatus: "booked", date:localDate ,sessionId:sessionId  },
        { appointmentStatus: "cancelled", paymentStatus: "refunded" }
      );

      await Promise.all(expiredAppointments.map(async (appointment) => {
        await this._userRepository.update(appointment.userId, {
          $inc: { walletBalance: appointment.fee },
        });
        // Optionally update analytics here if needed
        await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: appointment.fee,
          paymentFor: "refund",
          userId: appointment.userId,
          doctorId: appointment.doctorId
        });

        cancelledAppoitments.push({
                        appointmentId: (appointment._id as unknown as string).toString(),
                        userId: appointment.userId,
                        doctorName:appointment.doctorName,
                        date: appointment.date,
                        start: appointment.start,
                        end: appointment.end
                    });
      }));

    }

        const unAvailableSessions = await this._unAvailableSessionRepository.create({doctorId:doctorId,day:localDate,sessionId:sessionId});
        return {unAvailableSessions,cancelledAppoitments};


    }catch(error){
        console.error("Error in unAvailableSessions", error);
        throw new Error("Failed to make session unavailable");
    }
}

async makeSessionsAvailable(doctorId:string, day:Date, sessionId:string):Promise<IUnAvailableSessionDocument | null> {


    console.log("day is ....  ",day);
    let dateOnly = new Date(day);
      const yyyy = dateOnly.getFullYear();
      const mm = String(dateOnly.getMonth() + 1).padStart(2, "0");
      const dd = String(dateOnly.getDate()).padStart(2, "0");
      let localDate = `${yyyy}-${mm}-${dd}`;

    console.log("localDate for make session available is", localDate);

    const reponse = await this._unAvailableSessionRepository.findOne({doctorId:doctorId, day:localDate,sessionId:sessionId});
    console.log("session resp is ",reponse);
    
    if(reponse){
        const result = await this._unAvailableSessionRepository.delete(reponse._id.toString());
        return result;
    }
    throw new Error("No unavailable day found to make available");

}
 
async getUnavailablSessions(doctorId:string):Promise<{ day: string; sessionId: string }[] | [] |null>{
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
            let sess: { day: string; sessionId: string } = { day: item.day.toString(), sessionId: item.sessionId.toString() };
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








}