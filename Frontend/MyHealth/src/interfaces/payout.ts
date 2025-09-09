export interface payoutFilter {
        status?:string;
        startDate?: string;
        endDate?: string;
}

export interface payoutUpdateDto {
        status:string;
        paid?: number;
        transactionId?: string;
        invoiceLink?: string |"";
        on: string
}


export interface payoutDetails {
         
    bankAccNo?:string,
    bankAccHolderName?:string,
    bankIfscCode?: string

}