import {inject , injectable} from "inversify";
import { ISessionDocument } from "../../entities/sessionEntities";
import ISessionRepository from "../interfaces/ISessionRepository";
import BaseRepository from "./baseRepository";


@injectable()
export default class SessionRepository extends BaseRepository<ISessionDocument> implements ISessionRepository{

constructor(

    @inject("sessionModel") private _sessionModel : any,
){
    super(_sessionModel)
};



}
