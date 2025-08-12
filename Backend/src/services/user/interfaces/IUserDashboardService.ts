

export default interface IUserDashboardService {

    getDashboardContent(daysNumber:number,userId:string,latitude:number,longitude:number):Promise<any>
    
}