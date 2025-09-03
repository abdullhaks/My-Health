
import mongoose,{Schema} from "mongoose";
import { IPayoutDocument } from "../entities/payoutEntities";

const payoutSchema : Schema<IPayoutDocument> = new Schema ({
    doctorId:{type: String},
    bankAccNo:{type: String},
    bankAccHolderName:{type: String},
    bankIfscCode:{type: String},
    totalAmount:{type:Number},
    paid:{type:Number},
    serviceAmount:{type:Number},
    status : { type: String,enum: ["requested","paid","rejected"],default:"requested"},
    on:{type:Date},
    transactionId: { type: String},
    invoiceLink:{type:String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});


const payoutModel = mongoose.model<IPayoutDocument>("Payout",payoutSchema);

export default payoutModel;