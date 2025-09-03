import mongoose, { Schema, Document } from "mongoose";

export interface IOtpDocument extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema: Schema<IOtpDocument> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 120, 
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, 
  }
);

const OtpModel = mongoose.model<IOtpDocument>("Otp", otpSchema);

export default OtpModel;