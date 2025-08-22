import BaseRepository from "./baseRepository";
import IUnAvailableDayRepository from "../interfaces/IUnAvailableDayRepository";
import { IUnAvailableDayDocument } from "../../entities/unAvailableDayEntities";
import { inject,injectable } from "inversify";


@injectable()
export default class UnAvailableDayRepository extends BaseRepository<IUnAvailableDayDocument> implements IUnAvailableDayRepository{

constructor (
    @inject("unAvailableDayModel") private _unAvailableDayModel:any

){
super(_unAvailableDayModel)
}

}