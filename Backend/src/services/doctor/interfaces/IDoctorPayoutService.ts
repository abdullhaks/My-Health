
interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}
export default interface IDoctorPayoutService {

    requestPayout(payoutDetails:any,doctorId:string):Promise<any>
    getgetPayouts(doctorId:string,pageNumber:number, limitNumber:number, filters:filter):Promise<any[]>,
    

}
