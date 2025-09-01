import { IAnalytics } from "../../../dto/analyticsDto";

export default interface IAdminAnalyticsServices {

    getUserAnalytics(filter:string):Promise<{ name: string; value: number }[]>;
    getDoctorAnalytics(filter:string):Promise<{ name: string; value: number }[]>;
    getTotalAnalytics():Promise<IAnalytics>;
    
}