import BaseRepository from "./baseRepository";
import { inject,injectable } from "inversify";
import { IPayoutDocument } from "../../entities/payoutEntities";



@injectable()
export default class PayoutRepository extends BaseRepository<IPayoutDocument> {

    constructor(
        @inject("payoutModel") private _payoutModel:any
    ){

        super(_payoutModel)

    }

    async getPayouts(page: number, limit: number, query: any = {}): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const payouts = await this._payoutModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await this._payoutModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        payouts: payouts.map((payout: any) => ({
          _id: payout._id.toString(),
          bankAccNo: payout.bankAccNo,
          bankAccHolderName: payout.bankAccHolderName,
          bankIfscCode: payout.bankIfscCode,
          totalAmount: payout.totalAmount,
          paid: payout.paid || 0,
          serviceAmount: payout.serviceAmount||0,
          status:payout.status,
          transactionId: payout.transactionId,
          invoiceLink: payout.invoiceLink || "",
          createdAt: payout.createdAt,
          updatedAt: payout.updatedAt,
        })),
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching transactions:", err);
      throw new Error("Failed to fetch transactions");
    }
  }



}