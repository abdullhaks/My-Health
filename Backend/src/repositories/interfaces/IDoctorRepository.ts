import BaseRepository from "../implementations/baseRepository";
import { IDoctorDocument } from "../../entities/doctorEntities";
import { IDoctor } from "../../dto/doctorDTO";
import { PipelineStage } from "mongoose";


export default interface IDoctorRepository extends BaseRepository<IDoctorDocument>{

    fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<{doctors:IDoctor[] | null ,
            total:number,
            page:number,
            totalPages:number}> 

    findByEmail(email:string):Promise<IDoctor | null>;
    verifyDoctor(email:string):Promise<IDoctor | null>;
    aggregate<T=IDoctorDocument>(pipeline:PipelineStage[]): Promise<T[]>;
    getDoctors(page: number, search: string | undefined, limit: number,onlyPremium:boolean): Promise<{doctors:IDoctor[]|null,totalPages:number}>
    getDoctor(id:string):Promise<IDoctor | null>
    verifyDoctorByAdmin(id:string):Promise<IDoctor | null>
    declineDoctor(id:string,reason:string):Promise<IDoctor | null>
    blockDoctor(id:string):Promise<IDoctor | null>
    unblockDoctor(id:string):Promise<IDoctor | null>


  }