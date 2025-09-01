import { IPayouts } from "../../../dto/payoutDto";
interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}
export default interface IAdminPayoutService {

    
    getgetPayouts(pageNumber:number, limitNumber:number, filters:filter):Promise<IPayouts[]>,
    updatePayout(id:string, data:any):Promise<IPayouts>,

}
