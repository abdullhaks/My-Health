import { injectable , inject } from "inversify";
import doctorModel from "../../models/doctor";
import OtpModel from "../../models/otp";
import { IDoctorDocument } from "../../entities/doctorEntities";
import BaseRepository from "./baseRepository";
import IDoctorRepository from "../interfaces/IDoctorRepository";
import { FilterQuery, Model } from "mongoose";
import { IDoctor } from "../../dto/doctorDTO";
import { PipelineStage } from "mongoose";


@injectable()

export default class DoctorRepository extends BaseRepository<IDoctorDocument> implements IDoctorRepository{

    constructor(
        @inject("doctorModel") private _doctorModel: Model<IDoctorDocument>,
      
    ) {
        super(_doctorModel);
    }

       async fetchingDoctors(
        search: string,
        location: string,
        category: string,
        sort: string,
        page: number,
        limit: number
        ): Promise<{doctors:IDoctor[],
            total:number,
            page:number,
            totalPages:number}> {
        try {
            const query: FilterQuery<IDoctorDocument> = {
            isBlocked: false,
            isVerified: true,
            adminVerified:1,
            };

            if (search) {
            query.fullName = { $regex: search, $options: "i" };
            }
            if (location) {
            query["location.text"] = { $regex: location, $options: "i" };
            }
            if (category) {
            query.category = { $regex: category, $options: "i" };
            }

           let sortOption: Partial<{
                experience: 1 | -1;
                fullName: 1 | -1;
                }> = {};
            if (sort === "experience") {
            sortOption.experience = -1;
            } else if (sort === "alphabet") {
            sortOption.fullName = 1;
            }

            const skip = (page - 1) * limit;

            const [doctors, total] = await Promise.all([
            this._doctorModel.find(query).sort(sortOption).skip(skip).limit(limit),
            this._doctorModel.countDocuments(query)
            ]);

            return {
            doctors,
            total,
            page,
            totalPages: Math.ceil(total / limit)
            };
        } catch (err) {
            console.error("Error in repository fetchingDoctors:", err);
            throw err;
        }
        };


        async getDoctors(page: number, search: string | undefined, limit: number,onlyPremium:boolean): Promise<{doctors:IDoctor[]|null,totalPages:number}> {
        try {
            const query: FilterQuery<IDoctorDocument> = {};

            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }

            if (onlyPremium) {
                query.premiumMembership = true;
            }

            const skip = (page - 1) * limit;

            const doctors = await this._doctorModel
                .find(query)
                .skip(skip)
                .limit(limit);

                const total = await this._doctorModel.countDocuments(query);
            return {
                doctors,
                totalPages: Math.ceil(total / limit),
            };
         
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch doctors");
        }
    };

     async getDoctor(id:string):Promise<IDoctor | null>{

        try{

            const response = await this._doctorModel.findOne({_id:id});
            return response

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find doctor");
        }
    };


    
    async verifyDoctorByAdmin(id:string):Promise<IDoctor | null>{
        try{

            const resp = await this._doctorModel.findByIdAndUpdate(id,{adminVerified:1}, { new: true });
            console.log("doctor verifying....",resp);
            
            return resp;

        }catch(error){
            console.log(error);
            throw new Error ("doctor verifying has been failed")
        }
    };


    async declineDoctor(id:string,reason:string):Promise<IDoctor | null>{
        try{

            const resp = await this._doctorModel.findByIdAndUpdate(id,{adminVerified:3,rejectionReason:reason}, { new: true });
            console.log("doctor declining....",resp);
            
            return resp;

        }catch(error){
            console.log(error);
            throw new Error ("doctor declining has been failed") 
        }
    };


    async blockDoctor(id:string):Promise<IDoctor | null>{
        try{
            const resp =await this._doctorModel.findByIdAndUpdate(id, {isBlocked:true}, { new: true });
            console.log("resp form repo....",resp);
            return resp;


        }catch(error){
            console.log(error);
            throw new Error("doctor blockig has beeb failed")
        }
    };


    async unblockDoctor(id:string):Promise<IDoctor | null>{
        try{
            const resp =await this._doctorModel.findByIdAndUpdate(id, {isBlocked:false}, { new: true });
            console.log("resp form repo....",resp);
            return resp;

        }catch(error){
            console.log(error);
            throw new Error("doctor blockig has beeb failed")
        }
    };

    
    async findByEmail ( email:string):Promise<IDoctorDocument | null>{
            try{
    
                const doctor =await this._doctorModel.findOne({email:email});
                return doctor
    
            }catch(error){
                console.log(error);
                throw new Error("Fialed to find doctor with this email");
            }
        };


    async verifyDoctor(email: string): Promise<IDoctor | null> {
        try {
            const result = await this._doctorModel.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true } // returns updated document
            );
    
            if (!result) {
                throw new Error("doctor not found for verification.");
            }
    
            console.log("doctor verified successfully:", result);
            return result;
            
        } catch (error) {
            console.error("Error verifying doctor:", error);
            throw new Error("Failed to verify doctor with this email.");
        }
    };


    async aggregate<T=IDoctorDocument>(pipeline: PipelineStage[]): Promise<T[]> {
        try {
            const resp = await this._doctorModel.aggregate(pipeline);
            console.log("pipeline is .....", pipeline);
            console.log("resp is .....", resp);
            return resp;
        } catch (error) {
            console.error("Error in aggregate:", error);
            throw new Error("Failed to perform aggregation");
        }
        }
        

}