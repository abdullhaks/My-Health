export interface createOneTimePaymentMetaData {
        doctorId: string,
        doctorName?: string,
        doctorCategory?: string,
        userId: string, 
        concerns?:string,
        file1?: string,
        file2?: string
        file3?: string,
        file4?: string,
        file5?: string,
        fee: number,
        role:string,
        type: string,
        slotId?: string,
        sessionId?:string
        start?:string | Date,
        end?:string | Date,
        duration?:number,

      };


export interface walletPaymentData {
        doctorId:string,
        userId:string,
        userName: string,
        userEmail:string,
        date:string,
        slotId:string,
        sessionId:string,
        start:string | Date,
        end:string | Date,
        paymentType: string,
        duration:number,
        fee:number,
        paymentStatus: string,
        appointmentStatus: string,

      }       