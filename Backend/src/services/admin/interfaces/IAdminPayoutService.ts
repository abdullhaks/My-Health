
interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}
export default interface IAdminPayoutService {

    
    getgetPayouts(pageNumber:number, limitNumber:number, filters:filter):Promise<any[]>,
    updatePayout(id:string, data:any):Promise<any[]>,

}
