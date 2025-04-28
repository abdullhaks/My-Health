import { injectable , inject } from "inversify";
import doctorModel from "../../models/doctorModel";
import OtpModel from "../../models/otpModel";
import { IDoctorDocument } from "../../entities/doctorEntities";
import BaseRepository from "./baseRepository";
import IDoctorRepository from "../interfaces/IDoctorRepository";

@injectable()

export default class DoctorRepository extends BaseRepository<IDoctorDocument> implements IDoctorRepository{

    constructor(
        @inject("doctorModel") private _doctorModel: any,
      
    ) {
        super(_doctorModel);
    }


}