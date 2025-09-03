import {IDoctor} from "../../../dto/doctorDTO"


export default interface IAdminDoctorService {

    getDoctors(page:number,search:string | undefined,limit:number,onlyPremium:boolean): Promise<{doctors:IDoctor[]|null,totalPages:number}>
    getDoctor(id:string):Promise<IDoctor>
    verifyDoctor(id:string):Promise<IDoctor>
    declineDoctor(id:string,reason:string):Promise<IDoctor>
    block(id:string):Promise<IDoctor| null>
    unblock(id:string):Promise<IDoctor| null>

}