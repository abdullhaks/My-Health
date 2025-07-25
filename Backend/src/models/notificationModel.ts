import { Schema,model } from "mongoose";
import { INotificationDocument } from "../entities/notificationEntities";

const NotificationSchema  = new Schema<INotificationDocument>({

        date:{
            type:Date,
            default:Date.now()
        },
        message:{
            type:String,
            required:true
        },
        userId:{
            type:String,
            required:true
        },
        isRead:{
            type:Boolean,
            default:false
        },
        mention:{
            type:String,
            required:false
        },
        link:{
            type:String,
            required:false
        },
        type:{
            type:String,
            enum: ["appointment" , "payment" , "blog" , "add" , "newConnection" , "common" , "reportAnalysis"],
            default:"common",
            required:false
        },
        createdAt:{
            type:Date,
            default:Date.now()
        },
        

});


export default model<INotificationDocument>("Notification",NotificationSchema)