
export default interface IUserSessionService {
    getSessions (doctorId:string):Promise<any>
}