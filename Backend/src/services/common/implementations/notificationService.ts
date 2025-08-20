import { inject,injectable } from "inversify";
import INotificationServices from "../interfaces/INotificationService";
import INotificationRepository from "../../../repositories/interfaces/INotificationRepository";


@injectable()
export default class NotificationService implements INotificationServices {
    constructor(
        @inject("INotificationRepository") private _notificationRepository : INotificationRepository
    ){};


    async createNotification(notification: any): Promise<any> {
        
    };

    async getAllNotifications(id: string): Promise<any> {
        console.log("noti id is service......",id);


        const response = await this._notificationRepository.findAll({userId:id});
        return response;
    };


    async getNewNotifications(id:string,limit:number,notificationSet:number): Promise<any> {

        const response = await this._notificationRepository.getNewNotifications(id,limit,notificationSet);

        console.log("noti resp from bakc end ...",response);
        return response;
        
        
    };
    

    async readAllNotifications(id: string): Promise<any> {

        
        
    };


}