
import { inject,injectable } from "inversify";
import IUserSessionService from "../interfaces/IUserSessionService";
import ISessionRepository from "../../../repositories/interfaces/ISessionRepository";

@injectable()
export default class UserSessionService implements IUserSessionService {

    constructor(
        @inject("ISessionRepository") private _sessionRepository : ISessionRepository,
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

};