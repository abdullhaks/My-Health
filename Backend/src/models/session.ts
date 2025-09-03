import mongoose,{Schema} from "mongoose";
import { ISessionDocument } from "../entities/sessionEntities";

const sessionSchema : Schema<ISessionDocument> = new Schema ({

doctorId: { type: String, required: true },
dayOfWeek: { type: Number, required: true },
startTime: { type: String, required: true },
endTime: { type: String, required: true },
duration: { type: Number, required: true },
fee: { type: Number, required: true },
// rRule: { type: String, required: true },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now },

});

const sessionModel = mongoose.model<ISessionDocument>("Session",sessionSchema);
export default sessionModel;