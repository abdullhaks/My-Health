import mongoose,{Schema} from "mongoose";
import { IUserDocument } from "../entities/userEntities";

const userSchema : Schema<IUserDocument> = new Schema ({

    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: String },
    phone: { type: String },
    location: {
        type: {
            type: String,
            enum: ["Point"],  
           
        },
        coordinates: {
            type: [Number],
        }
    },
    gender: { type: String },
    dob: { type: Date },
    isBlocked: { type: Boolean, default: false },
    bmi: { type: String },
    latestHealthSummary: { type: String },
    walletBalance: { type: Number, default: 0 },
    tags: { type: [String] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});


const userModel = mongoose.model<IUserDocument>("User",userSchema);

export default userModel;