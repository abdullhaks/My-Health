import BaseRepository from "../implementations/baseRepository";
import { IDoctorDocument } from "../../entities/doctorEntities";


export default interface IDoctorRepository extends BaseRepository<IDoctorDocument>{

    fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<any> 
    findByEmail(email:string):Promise<IDoctorDocument>;
    findLatestOtpByEmail(email: string): Promise<any>;
    verifyDoctor(email:string):Promise<IDoctorDocument>;
    aggregate(pipeline: ({ $match: { createdAt: { $gte: Date; $lte: Date; }; }; } | { $group: { _id: { [x: string]: string; }; count: { $sum: number; }; }; } | { $sort: { _id: number; }; } | { $project: { name: string; value: string;}; })[]): unknown;
}