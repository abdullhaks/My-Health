import mongoose,{Schema} from "mongoose";
import { IAdminDocument } from "../entities/adminEntities";

const adminSchema : Schema<IAdminDocument> = new Schema ({

    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});


const adminModel = mongoose.model<IAdminDocument>("Admin",adminSchema);

export default adminModel;