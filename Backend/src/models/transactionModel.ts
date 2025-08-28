import mongoose,{Schema} from "mongoose";
import { ITransactionDocument } from "../entities/transactionsEntities";

const transactionSchema : Schema<ITransactionDocument> = new Schema ({
    date:{type: Date , default: Date.now},
    from: { type: String , enum: ["doctor","user","admin"] },
    to: { type: String,enum: ["doctor","user","admin"]},
    method: { type: String,enum: ["stripe","wallet","bank"]},
    amount:{type:Number},
    paymentFor: { type: String,enum: ["subscription","appointment","analysis","refund","salary"]},
    appointmentId: { type: String},
    analysisId: { type: String},
    transactionId: { type: String},
    userId: { type: String},
    doctorId: { type: String},
    invoice:{type:String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});


const transactionModel = mongoose.model<ITransactionDocument>("Transaction",transactionSchema);

export default transactionModel;