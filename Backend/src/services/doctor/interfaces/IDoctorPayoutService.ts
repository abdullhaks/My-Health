
export default interface IDoctorPayoutService {

    requestPayout(payoutDetails:any,doctorId:string):Promise<any>
    

}
