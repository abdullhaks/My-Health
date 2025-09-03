import { Schema, model } from "mongoose";
import { IReportAnalysisDocument } from "../entities/reportAnalysisEntities";

const reportAnalysisSchema = new Schema<IReportAnalysisDocument>(
  {


    doctorId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    files: {
      type: [String],
    },
    concerns: {
      type: String,
      required: true,
    },
    doctorName: {
      type:String,
      required: true,
    },
    doctorCategory: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: false,
    },
    result:{
      type: String,
      default: "",
    },
    analysisStatus: {
      type: String,
      enum: ["pending", "cancelled", "submited",],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

  },
  
  {
    timestamps: true,
  }
);

export default model<IReportAnalysisDocument>("ReportAnalysis", reportAnalysisSchema);