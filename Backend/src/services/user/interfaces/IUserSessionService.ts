
export default interface IUserSessionService {
    getSessions (doctorId:string):Promise<any>;
    getBookedSlots (doctorId:string,formattedDate:string):Promise<any>;
}