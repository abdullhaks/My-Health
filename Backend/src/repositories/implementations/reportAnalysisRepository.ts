import { injectable , inject } from "inversify";
import { IReportAnalysisDocument } from "../../entities/reportAnalysisEntities";
import BaseRepository from "./baseRepository";
import IReportAnalysisRepository from "../interfaces/IReportAnalysisRepository";

@injectable()

export default class ReportAnalysisRepository extends BaseRepository<IReportAnalysisDocument> implements IReportAnalysisRepository{

    constructor(
        @inject("reportAnalysisModel") private _reportModel: any,
      
    ) {
        super(_reportModel);
    }



}