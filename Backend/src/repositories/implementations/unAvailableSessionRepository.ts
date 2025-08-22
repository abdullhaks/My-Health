import BaseRepository from "./baseRepository";
import IUnAvailableSessionRepository from "../interfaces/IUnAvailableSessionRepository";
import { IUnAvailableSessionDocument } from "../../entities/unAvailableSessionEntities";
import { inject,injectable } from "inversify";


@injectable()
export default class UnAvailableSessionRepository extends BaseRepository<IUnAvailableSessionDocument> implements IUnAvailableSessionRepository{

constructor (
    @inject("unAvailableSessionModel") private _unAvailableSessionModel:any

){
super(_unAvailableSessionModel)
}

}
