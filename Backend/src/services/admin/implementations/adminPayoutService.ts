import { inject,injectable } from "inversify";
import IAdminPayoutService from "../interfaces/IAdminPayoutService";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import IPayoutRepository from "../../../repositories/interfaces/IPayoutRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { IPayouts } from "../../../dto/payoutDto";

interface filter {
  status?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()
export default class AdminPayoutService implements IAdminPayoutService {
    
    constructor(
        @inject("ITransactionRepository") private _transactionRepository : ITransactionRepository,
        @inject("IPayoutRepository") private _payoutRepository : IPayoutRepository,
        @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,

    ){};



     async getgetPayouts(pageNumber:number, limitNumber:number, filters:filter = {}): Promise<IPayouts[]> {
    const query: any = {};

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



    async updatePayout(id:string, data:any): Promise<IPayouts> {
   

    const resp = await this._payoutRepository.update(id,data);
      console.log("payourt respo is ",resp);
    
    if (!resp?.doctorId) {
      throw new Error("doctorId is undefined");
    }
    const updateWalet = await this._doctorRepository.update(resp.doctorId, {
        $inc: { walletBalance: resp?.totalAmount },
      });

      console.log("wallet respo is ",updateWalet);


    return resp;
  }


}