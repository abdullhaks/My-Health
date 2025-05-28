
import { inject,injectable } from "inversify";
import IDoctorSessionService from "../interfaces/IDoctorSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";

@injectable()
export default class DoctorSessionService implements IDoctorSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
    ){

    };


   async addSessions(sessionData: any): Promise<any> {
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




};