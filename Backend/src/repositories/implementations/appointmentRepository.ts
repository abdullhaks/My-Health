// import { injectable, inject } from "inversify";
// import doctorModel from "../../models/doctorModel";
// import { IDoctorDocument } from "../../entities/doctorEntities";
// import BaseRepository from "./baseRepository";
// import IAppointmentRepository from "../interfaces/IAppointmentRepository";

// @injectable()
// export default class AppointmentRepository
//   extends BaseRepository<IDoctorDocument>
//   implements IAppointmentRepository
// {
//   constructor(@inject("doctorModel") private _doctorModel: any) {
//     super(_doctorModel);
//   }

//   async fetchingDoctors(
//     search: string,
//     location: string,
//     category: string,
//     sort: string,
//     page: number,
//     limit: number
//   ): Promise<any> {
//     try {
//       const query: any = {
//         isBlocked: false,
//         isVerified: true,
//         adminVerified: 1,
//       };

//       if (search) {
//         query.fullName = { $regex: search, $options: "i" };
//       }
//       if (location) {
//         query["location.text"] = { $regex: location, $options: "i" };
//       }
//       if (category) {
//         query.category = { $regex: category, $options: "i" };
//       }

//       let sortOption: any = {};
//       if (sort === "experience") {
//         sortOption.experience = -1;
//       } else if (sort === "alphabet") {
//         sortOption.fullName = 1;
//       }

//       const skip = (page - 1) * limit;

//       const [doctors, total] = await Promise.all([
//         this._doctorModel.find(query).sort(sortOption).skip(skip).limit(limit),
//         this._doctorModel.countDocuments(query),
//       ]);

//       return {
//         doctors,
//         total,
//         page,
//         totalPages: Math.ceil(total / limit),
//       };
//     } catch (err) {
//       console.error("Error in repository fetchingDoctors:", err);
//       throw err;
//     }
//   }
// }
