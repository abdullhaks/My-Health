import { Payout,filter } from "../../../dto/transactionDto"; 



export default interface IDoctorTransactionsService {

getRevenues(doctorId: string, pageNumber: number, limitNumber: number, filters: filter ): Promise<{ payouts: Payout[]; totalPages: number }> 

};




