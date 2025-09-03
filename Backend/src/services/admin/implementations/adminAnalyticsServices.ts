import { inject,injectable} from "inversify";
import IAdminAnalyticsServices from "../interfaces/IAdminAnalyticsServices";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import {MESSAGES} from "../../../utils/messages"
import { IAnalytics } from "../../../dto/analyticsDto";

injectable();
export default class AdminAnalyticsServices implements IAdminAnalyticsServices {


    constructor(
        @inject( "IUserRepository") private _userRepository:IUserRepository,
        @inject("IDoctorRepository") private _doctorRepository:IDoctorRepository,
        @inject("IAnalyticsRepository") private _analyticsRepository:IAnalyticsRepository,
        @inject("ITransactionRepository") private _transactionRepository:ITransactionRepository,

        
    ){}

async getUserAnalytics(filter: string): Promise<{ name: string; value: number }[]> {
  try {
    const now = new Date();
    let matchStage: any = {};
    let groupStage: any = {};
    let projectStage: any = {};
    let sortStage: any = { $sort: { _id: 1 } };

    switch (filter) {
      case "day": {
        // Get Monday of current week
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        matchStage = {
          createdAt: { $gte: monday, $lte: sunday },
        };
        groupStage = {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      case "week": {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        matchStage = {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        };
        groupStage = {
          _id: {
            $toInt: {
              $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] },
            },
          },
          count: { $sum: 1 },
        };
        projectStage = {
          name: { $concat: ["Week ", { $toString: "$_id" }] },
          value: "$count",
        };
        break;
      }

      case "month": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        matchStage = {
          createdAt: { $gte: yearStart, $lte: yearEnd },
        };
        groupStage = {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      case "year": {
        matchStage = {}; // No time constraint, get all years
        groupStage = {
          _id: { $year: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      default:
        throw new Error("Invalid filter");
    }

    const pipeline = [
      { $match: matchStage },
      { $group: groupStage },
      sortStage,
      { $project: projectStage },
    ];

    const rawData = await this._userRepository.aggregate<{ name: string; value: number }>(pipeline);

    // Format results
    switch (filter) {
      case "day": {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return rawData.map(({ name, value }) => ({
          name: days[(Number(name) % 7)],
          value,
        }));
      }

      case "month": {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return rawData.map(({ name, value }) => ({
          name: months[Number(name) - 1] || name,
          value,
        }));
      }

      default:
        return rawData;
    }

  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw new Error(MESSAGES.analytics.failedTofetch);
  }
}


async getDoctorAnalytics(filter: string): Promise<{ name: string; value: number }[]> {
  try {
    const now = new Date();
    let matchStage: any = {};
    let groupStage: any = {};
    let projectStage: any = {};
    let sortStage: any = { $sort: { _id: 1 } };

    switch (filter) {
      case "day": {
        // Get Monday of current week
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        matchStage = {
          createdAt: { $gte: monday, $lte: sunday },
        };
        groupStage = {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      case "week": {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        matchStage = {
          createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        };
        groupStage = {
          _id: {
            $toInt: {
              $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] },
            },
          },
          count: { $sum: 1 },
        };
        projectStage = {
          name: { $concat: ["Week ", { $toString: "$_id" }] },
          value: "$count",
        };
        break;
      }

      case "month": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        matchStage = {
          createdAt: { $gte: yearStart, $lte: yearEnd },
        };
        groupStage = {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      case "year": {
        matchStage = {}; // No time constraint, get all years
        groupStage = {
          _id: { $year: "$createdAt" },
          count: { $sum: 1 },
        };
        projectStage = {
          name: "$_id",
          value: "$count",
        };
        break;
      }

      default:
        throw new Error("Invalid filter");
    }

    const pipeline = [
      { $match: matchStage },
      { $group: groupStage },
      sortStage,
      { $project: projectStage },
    ];

    const rawData = await this._doctorRepository.aggregate <{ name: string; value: number }>(pipeline);



    // Format results
    switch (filter) {
      case "day": {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return rawData.map(({ name, value }) => ({
          name: days[(Number(name) % 7)],
          value,
        }));
      }

      case "month": {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return rawData.map(({ name, value }) => ({
          name: months[Number(name) - 1] || name,
          value,
        }));
      }

      default:
        return rawData;
    }

  } catch (error) {
    console.error("Error in getUserAnalytics:", error);
    throw new Error("Failed to fetch user analytics");
  }
};


async getTotalAnalytics ():Promise<IAnalytics>{

try{

  const response = await this._analyticsRepository.findOne({dataSet:"1"});
  if(!response){
    throw new Error ("internal error in getTotalAnalytics")
  };

  return response;

}catch(err){
  console.log("error in getTotalAnalytics service",err);
  throw new Error("error in getTotalAnalytics service")
  
}





}

};