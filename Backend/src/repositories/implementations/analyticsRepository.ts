import {inject , injectable} from "inversify";
import { IAnalyticsDocument } from "../../entities/analyticsEntities"; 
import IAnalyticsRepository from "../interfaces/IAnalyticsRepository";
import BaseRepository from "./baseRepository";


@injectable()
export default class AnalyticsRepository extends BaseRepository<IAnalyticsDocument> implements IAnalyticsRepository{

constructor(

    @inject("analyticsModel") private _analyticsModel : any,
){
    super(_analyticsModel)
};
 
async uptadeOneWithUpsert(
    filter: any,
    update: any
): Promise<IAnalyticsDocument> {
    try {
        const options = { upsert: true, new:true, strict: false };
        const updatedDocument = await this._analyticsModel.findOneAndUpdate(filter, update, options);
        return updatedDocument;
    } catch (err) {
       console.log("Error updating document",err);
       throw err;
    }

};

}
