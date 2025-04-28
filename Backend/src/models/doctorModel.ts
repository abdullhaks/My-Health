import mongoose,{Schema} from "mongoose";
import { IDoctorDocument } from "../entities/doctorEntities";

const doctorSchema : Schema<IDoctorDocument> = new Schema ({

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
        },
        text: { type: String,default: "" },
    },
    gender: { type: String },
    dob: { type: String },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    adminVerified:{ type: Number, default: 0 },
    rejectionReason:{ type: String },
    graduation:{ type: String },
    graduationCertificate:{ type: String },
    category:{ type: String },
    registerNo:{ type: String },
    registrationCertificate:{ type: String },
    experience:{ type: Number },
    specializations:{type:[{
        title:{type:String},
        certificate:{type:String}
    }]},
    verificationId:{ type: String },
    walletBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});


const doctorModel = mongoose.model<IDoctorDocument>("Doctor",doctorSchema);

export default doctorModel;