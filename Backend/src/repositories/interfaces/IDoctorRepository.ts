import BaseRepository from "../implementations/baseRepository";
import { IDoctorDocument } from "../../entities/doctorEntities";


export default interface IDoctorRepository extends BaseRepository<IDoctorDocument>{

    findByEmail(email:string):Promise<IDoctorDocument>;
    findLatestOtpByEmail(email: string): Promise<any>;
    verifyDoctor(email:string):Promise<IDoctorDocument>;
}