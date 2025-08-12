import mongoose,{Schema} from "mongoose";
import { IAnalyticsDocument } from "../entities/analyticsEntities";

const analyticsSchema : Schema<IAnalyticsDocument> = new Schema ({
    dataSet:{type: String , default:"1"},
    totalUsers: { type: Number ,default:0},
    totalDoctors: { type: Number,default:0},
    totalRevenue: { type: Number,default:0},
    totalPaid: { type: Number,default:0 },
    totalConsultations: { type: Number,default:0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    

});


const analyticsModel = mongoose.model<IAnalyticsDocument>("Analytic",analyticsSchema);

export default analyticsModel;