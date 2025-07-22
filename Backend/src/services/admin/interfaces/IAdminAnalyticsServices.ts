

export default interface IAdminAnalyticsServices {

    getUserAnalytics(filter:string):Promise<any>;
    getDoctorAnalytics(filter:string):Promise<any>;
    getTotalAnalytics():Promise<any>;
    
}