import { inject,injectable } from "inversify";
import IDoctorPayoutService from "../interfaces/IDoctorPayoutService";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IPayoutRepository from "../../../repositories/interfaces/IPayoutRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";

interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class DoctorPayoutService implements IDoctorPayoutService {
    
    constructor(
        @inject("ITransactionRepository") private _transactionRepository : ITransactionRepository,
        @inject("IPayoutRepository") private _payoutRepository : IPayoutRepository,
        @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,

    ){};

    async requestPayout(payoutDetails:any,doctorId:string): Promise<any> {

        const doctor = await this._doctorRepository.findOne({_id:doctorId});
        if(!doctor){
            throw new Error ("invalied credentials")
        }

        
        
        const response = await this._payoutRepository.create({
            doctorId:doctorId,
            bankAccNo:payoutDetails.bankAccNo,
            bankAccHolderName:payoutDetails.bankAccHolderName,
            bankIfscCode:payoutDetails.bankIfscCode,
            totalAmount:doctor.walletBalance,
        });

        if(!response){
            throw new Error ("payout request failed");
        }

        const walletManage = await this._doctorRepository.update(doctorId,{walletBalance:0})
        if(!walletManage){
            throw new Error ("payout request failed");
        }
         const { password, ...userWithoutPassword } = walletManage.toObject();
              
                        if(userWithoutPassword.profile){
                          userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
                        }
        return {
            message: "payout requested",
            updatedDoctor: userWithoutPassword,
            };
        
    };


     async getgetPayouts(doctorId:string,pageNumber:number, limitNumber:number, filters:filter = {}): Promise<any[]> {
    const query: any = {doctorId:doctorId};

    if (filters.status) {
      console.log("status....",filters.status)
      query.status = filters.status;
    }
   
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const transactions = await this._payoutRepository.getPayouts(pageNumber, limitNumber, query);
    console.log("transactions from service...", transactions);

    return transactions;
  }


}