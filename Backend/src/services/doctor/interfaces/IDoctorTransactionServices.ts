

interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}



export default interface IDoctorTransactionsService {

getRevenues(doctorId: string, pageNumber: number, limitNumber: number, filters: filter ): Promise<{ payouts: any[]; totalPages: number }> 

};




