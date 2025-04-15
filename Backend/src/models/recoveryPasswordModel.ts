import mongoose, { Schema, Document } from "mongoose";

export interface IRecoveryPasswordDocument extends Document {
  email: string;
  recoveryPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

const recoveryPasswordSchema: Schema<IRecoveryPasswordDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    recoveryPassword: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours in seconds
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const RecoveryPasswordModel = mongoose.model<IRecoveryPasswordDocument>(
  "RecoveryPassword",
  recoveryPasswordSchema
);

export default RecoveryPasswordModel;
