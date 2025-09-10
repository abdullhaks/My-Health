export interface reportAnalysisData {
_id: string
doctorId:string 
userId: string 
concerns: string
files:Array<string>
doctorName: string
doctorCategory: string,
createdAt: Date;
fee: number 
transactionId?: string
analysisStatus:string;
result: string;
updatedAt:Date;
}