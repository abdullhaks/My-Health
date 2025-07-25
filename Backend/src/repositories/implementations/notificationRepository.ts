import { inject,injectable } from "inversify";
import INotificationRepository from "../interfaces/INotificationRepository";
import BaseRepository from "./baseRepository";
import { INotificationDocument } from "../../entities/notificationEntities";

@injectable()
export default class NotificationRepository extends BaseRepository<INotificationDocument> implements INotificationRepository {

    constructor(
        @inject("notificationModel") private _notificationModel:any
    ){
        super(_notificationModel)
    }

    async getNewNotifications(id:string,limit:number,notificationSet:number):Promise<any>{
        try{

             const query: any = {userId: id };

            const skip = (notificationSet - 1) * limit;

            const notifications = await this._notificationModel
                .find(query)
                .skip(skip)
                .limit(limit);

                const total = await this._notificationModel.countDocuments({userId:id,isRead:false});
            return {
                notifications,
                totalPages: Math.ceil(total / limit),
            };


        }catch(error){
            console.log(error);
            throw new Error("Failed to fetch notifications");
        }
    }

}



