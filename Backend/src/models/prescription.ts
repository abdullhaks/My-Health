import {Schema,model} from "mongoose"
import IPrescriptionDocument from "../entities/prescriptionEntities";

const prescriptionSchema = new Schema<IPrescriptionDocument>({

    appointmentId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    doctorId:{
        type:String,
        required:true
    },
    medicalCondition:{
        type:String,
        required:true
    },
    medications:{
        type:[Object],
        required:true
    },
    medicationPeriod:{
        type:Number,
        default:3
    },
    notes:{
        type:String,
        required:false
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }


});

export default model<IPrescriptionDocument>("Prescription",prescriptionSchema)
