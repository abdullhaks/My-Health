
import BaseRepository from "../implementations/baseRepository";
import { INotificationDocument } from "../../entities/notificationEntities";


export default interface INotificationRepository extends BaseRepository<INotificationDocument>{

getNewNotifications(id:string,limit:number,notificationSet:number):Promise<any>

}