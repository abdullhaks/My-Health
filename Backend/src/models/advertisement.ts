import { IAdvertisementDocument } from "../entities/advertisementEntitites";
import { model,Schema } from "mongoose";

const advertisementSchema = new Schema<IAdvertisementDocument>(

    {

        
        title:{
            type:String,
            required:true
        },
        author:{
            type:String,
            required:true
        },
        authorId:{
            type:String,
            required:true
        },
        location:{
            type:Object,
            required:true
        },
        tags:{
            type:[String],
            required:true
        },
        videoUrl:{
            type:String,
            required:true,
        },
        pack:{
            type:String,
            required:false
        },
        fee:{
            type:Number,
            required:false
        },
        views:{
            type:Number,
            required:true,
            default:0
        },
        clicks:{
            type:Number,
            required:true,
            default:0
        },
        expDate:{
            type:Date,
            required:false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },

    }



);

advertisementSchema.index({ location: "2dsphere" });

export default model<IAdvertisementDocument>("Advertisement",advertisementSchema);

