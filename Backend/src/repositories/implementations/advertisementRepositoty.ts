import BaseRepository from "./baseRepository";
import IAdvertisementRepository from "../interfaces/IAdvertisementRepository";
import { IAdvertisementDocument } from "../../entities/advertisementEntitites";
import { inject,injectable } from "inversify";


@injectable()
export default class AdvertisementRepository extends BaseRepository<IAdvertisementDocument> implements IAdvertisementRepository{

    constructor(
        @inject("AdvertisementModel") private _advertisementModel:any
    ){
        super(_advertisementModel)
    };



}