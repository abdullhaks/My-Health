import BaseRepository from "../implementations/baseRepository";
import { IAnalyticsDocument } from "../../entities/analyticsEntities"; 

export default interface IAnalyticsRepository extends BaseRepository<IAnalyticsDocument>{

     uptadeOneWithUpsert(
        filter: any,
        update: any
    ): Promise<IAnalyticsDocument>

}